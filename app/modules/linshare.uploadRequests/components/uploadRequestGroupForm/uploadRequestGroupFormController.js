angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupFormController', uploadRequestGroupFormController);

uploadRequestGroupFormController.$inject = [
  'moment',
  '$timeout',
  'formUtilsService',
  'lsAppConfig',
  'sidebarService',
  'toastService',
  'uploadRequestUtilsService',
];

function uploadRequestGroupFormController(
  moment,
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
  uploadRequestGroupFormVm.disableEditValueOfDate = disableEditValueOfDate;
  uploadRequestGroupFormVm.enableEditValueOfDate = enableEditValueOfDate;
  uploadRequestGroupFormVm.changeHour = changeHour;
  uploadRequestGroupFormVm.enableEditActivationDate = true;
  uploadRequestGroupFormVm.enableEditExpirationDate = true;
  uploadRequestGroupFormVm.enableEditNotificationDate = true;

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
    console.log('hello');
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

  function disableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.activationDate = undefined;
        uploadRequestGroupFormVm.enableEditActivationDate = false;
        break;
      case 'expirationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.expiryDate = undefined;
        uploadRequestGroupFormVm.enableEditExpirationDate = false;
        break;
      case 'notificationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.notificationDate = undefined;
        uploadRequestGroupFormVm.enableEditNotificationDate = false;
        break;
    }

    uploadRequestGroupFormVm.uploadRequestGroupObject.calculateDatePickerOptions();
    revalidateDateFields();
  }

  function enableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestGroupFormVm.enableEditActivationDate = true;
        break;
      case 'expirationDate':
        uploadRequestGroupFormVm.enableEditExpirationDate = true;
        break;
      case 'notificationDate':
        uploadRequestGroupFormVm.enableEditNotificationDate = true;
        break;
    }

    uploadRequestGroupFormVm.uploadRequestGroupObject.setDefaultValueOfDate(dateType);
    uploadRequestGroupFormVm.uploadRequestGroupObject.calculateDatePickerOptions();
    revalidateDateFields();
  }

  function changeHour(hour, dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.activationDate = moment(uploadRequestGroupFormVm.uploadRequestGroupObject.activationDate).set({ hour }).toDate();
        break;
      case 'expirationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.expiryDate = moment(uploadRequestGroupFormVm.uploadRequestGroupObject.expiryDate).set({ hour }).toDate();
        break;
      case 'notificationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.notificationDate = moment(uploadRequestGroupFormVm.uploadRequestGroupObject.notificationDate).set({ hour }).toDate();
        break;
    }
  }
}
