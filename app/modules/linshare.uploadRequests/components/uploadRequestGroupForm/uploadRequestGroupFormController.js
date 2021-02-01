angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupFormController', uploadRequestGroupFormController);

uploadRequestGroupFormController.$inject = [
  '$timeout',
  'formUtilsService',
  'lsAppConfig',
  'sidebarService',
  'toastService',
  'uploadRequestUtilsService'
];

function uploadRequestGroupFormController(
  $timeout,
  formUtilsService,
  lsAppConfig,
  sidebarService,
  toastService,
  uploadRequestUtilsService
) {
  const uploadRequestGroupFormVm = this;
  const { setSubmitted } = formUtilsService;
  const {
    onCreateSuccess,
    onCreateError,
    onUpdateSuccess,
    onUpdateError
  } = sidebarService.getData();
  const { showToastAlertFor } = uploadRequestUtilsService;

  uploadRequestGroupFormVm.revalidateDateFields = revalidateDateFields;
  uploadRequestGroupFormVm.$onInit = onInit;
  uploadRequestGroupFormVm.toggleDisplayAdvancedOptions = toggleDisplayAdvancedOptions;

  function onInit() {
    uploadRequestGroupFormVm.dsplayAdvancedOptions = uploadRequestGroupFormVm.displayAdvancedOptions || false;

    switch (sidebarService.getContent()) {
      case lsAppConfig.uploadRequestGroupCreate:
        sidebarService.addData('createUploadRequestGroup', createUploadRequestGroup);
        break;

      case lsAppConfig.uploadRequestGroupDetails:
        sidebarService.addData('updateUploadRequestGroup', updateUploadRequestGroup);
        break;
    }
  }

  function revalidateDateFields() {
    $timeout(() => {
      uploadRequestGroupFormVm.form.notificationDate.$validate();
      uploadRequestGroupFormVm.form.expirationDate.$validate();
      uploadRequestGroupFormVm.form.activationDate.$validate();
    });
  }

  function toggleDisplayAdvancedOptions() {
    if (uploadRequestGroupFormVm.displayAdvancedOptions) {
      uploadRequestGroupFormVm.displayAdvancedOptions = false;
    } else {
      uploadRequestGroupFormVm.displayAdvancedOptions = true;
      $('#upload-request-edit').animate(
        {
          scrollTop: $('#advanced-options-anchor').offset().top
        },
        400
      );
    }
  }

  function focusToError(form) {
    const invalidFields = $('input.ng-invalid, textarea.ng-invalid');

    if (invalidFields.length) {
      if (
        ( form.notificationDate && form.notificationDate.$invalid ) ||
        ( form.totalSizeOfFiles && form.totalSizeOfFiles.$invalid ) ||
        ( form.protectedByPassword && form.protectedByPassword.$invalid ) ||
        ( form.canDelete && form.canDelete.$invalid ) ||
        ( form.canClose && form.canClose.$invalid )
      ) {
        uploadRequestGroupFormVm.displayAdvancedOptions = true;
      }

      invalidFields.first().trigger('focus');
    }
  }

  function createUploadRequestGroup() {
    if (uploadRequestGroupFormVm.uploadRequestGroupObject.getNewRecipients().length === 0) {
      return toastService.error({key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT_UPLOAD_REQUEST'});;
    }

    if (!uploadRequestGroupFormVm.form.$valid) {
      setSubmitted(uploadRequestGroupFormVm.form);
      focusToError(uploadRequestGroupFormVm.form);
    } else {
      uploadRequestGroupFormVm.uploadRequestGroupObject.create()
        .then(created => {
          showToastAlertFor('create', 'info');

          return onCreateSuccess(created);
        })
        .catch(error => {
          showToastAlertFor('create', 'error');

          return onCreateError(error);
        });
    }
  }

  function updateUploadRequestGroup() {
    if (!uploadRequestGroupFormVm.form.$valid) {
      setSubmitted(uploadRequestGroupFormVm.form);
      focusToError(uploadRequestGroupFormVm.form);
    } else {
      uploadRequestGroupFormVm.uploadRequestGroupObject.update()
        .then(updated => {
          showToastAlertFor('update', 'info');

          return onUpdateSuccess(updated);
        })
        .catch(error => {
          showToastAlertFor('update', 'error');

          return onUpdateError(error);
        });
    }
  }
}
