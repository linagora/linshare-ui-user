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

  uploadRequestGroupFormVm.$onInit = onInit;
  uploadRequestGroupFormVm.onActivationDateChange = handleChangeOf('activationDate');
  uploadRequestGroupFormVm.onExpiryDateChange = handleChangeOf('expiryDate');
  uploadRequestGroupFormVm.onNotificationDateChange = handleChangeOf('notificationDate');
  uploadRequestGroupFormVm.toggleDisplayAdvancedOptions = toggleDisplayAdvancedOptions;
  uploadRequestGroupFormVm.disableEditValueOfDate = disableEditValueOfDate;
  uploadRequestGroupFormVm.enableEditValueOfDate = enableEditValueOfDate;

  function onInit() {
    uploadRequestGroupFormVm.dsplayAdvancedOptions = uploadRequestGroupFormVm.displayAdvancedOptions || false;
    uploadRequestGroupFormVm.enableEditActivationDate = !!uploadRequestGroupFormVm.uploadRequestGroupObject.activationDate;
    uploadRequestGroupFormVm.enableEditExpirationDate = !!uploadRequestGroupFormVm.uploadRequestGroupObject.expiryDate;
    uploadRequestGroupFormVm.enableEditNotificationDate = !!uploadRequestGroupFormVm.uploadRequestGroupObject.notificationDate;

    switch (sidebarService.getContent()) {
      case lsAppConfig.uploadRequestGroupCreate:
        sidebarService.addData('createUploadRequestGroup', createUploadRequestGroup);
        break;

      case lsAppConfig.uploadRequestGroupDetails:
        sidebarService.addData('updateUploadRequestGroup', updateUploadRequestGroup);
        break;
    }
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

    validateAllDatetimeFields();

    if (!uploadRequestGroupFormVm.form.$valid) {
      setSubmitted(uploadRequestGroupFormVm.form);
      focusToError(uploadRequestGroupFormVm.form);
    } else {
      uploadRequestGroupFormVm.uploadRequestGroupObject.create()
        .then(created => {
          showToastAlertFor('create', 'info');

          return onCreateSuccess && onCreateSuccess(created);
        })
        .catch(error => {
          showToastAlertFor('create', 'error');

          return onCreateError && onCreateError(error);
        });
    }
  }

  function updateUploadRequestGroup() {
    validateAllDatetimeFields();

    if (!uploadRequestGroupFormVm.form.$valid) {
      setSubmitted(uploadRequestGroupFormVm.form);
      focusToError(uploadRequestGroupFormVm.form);
    } else {
      uploadRequestGroupFormVm.uploadRequestGroupObject.update()
        .then(updated => {
          showToastAlertFor('update', 'info');

          return onUpdateSuccess && onUpdateSuccess(updated);
        })
        .catch(error => {
          showToastAlertFor('update', 'error');

          return onUpdateError && onUpdateError(error);
        });
    }
  }

  function disableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.activationDate = undefined;
        uploadRequestGroupFormVm.enableEditActivationDate = false;
        break;
      case 'expiryDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.expiryDate = undefined;
        uploadRequestGroupFormVm.enableEditExpirationDate = false;
        break;
      case 'notificationDate':
        uploadRequestGroupFormVm.uploadRequestGroupObject.notificationDate = undefined;
        uploadRequestGroupFormVm.enableEditNotificationDate = false;
        break;
    }

    validateAllDatetimeFields();
  }

  function enableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestGroupFormVm.enableEditActivationDate = true;
        break;
      case 'expiryDate':
        uploadRequestGroupFormVm.enableEditExpirationDate = true;
        break;
      case 'notificationDate':
        uploadRequestGroupFormVm.enableEditNotificationDate = true;
        break;
    }

    uploadRequestGroupFormVm.uploadRequestGroupObject.setDefaultValueOfDate(dateType);
    validateAllDatetimeFields();
  }

  function validateAllDatetimeFields()  {
    $timeout(() => {
      uploadRequestGroupFormVm.uploadRequestGroupObject.calculateDatePickerOptions();

      if (
        uploadRequestGroupFormVm.form.notificationDate &&
        uploadRequestGroupFormVm.form.notificationDate.date &&
        uploadRequestGroupFormVm.form.notificationDate.hour
      ) {
        uploadRequestGroupFormVm.form.notificationDate.date.$validate();
        uploadRequestGroupFormVm.form.notificationDate.hour.$validate();
      }

      if (
        uploadRequestGroupFormVm.form.expiryDate &&
        uploadRequestGroupFormVm.form.expiryDate.date &&
        uploadRequestGroupFormVm.form.expiryDate.hour
      ) {
        uploadRequestGroupFormVm.form.expiryDate.date.$validate();
        uploadRequestGroupFormVm.form.expiryDate.hour.$validate();
      }

      if (
        uploadRequestGroupFormVm.form.activationDate &&
        uploadRequestGroupFormVm.form.activationDate.date &&
        uploadRequestGroupFormVm.form.activationDate.hour
      ) {
        uploadRequestGroupFormVm.form.activationDate.date.$validate();
        uploadRequestGroupFormVm.form.activationDate.hour.$validate();
      }
    });
  }

  function handleChangeOf(dateType) {
    return value => {
      uploadRequestGroupFormVm.uploadRequestGroupObject[dateType] = value;
      validateAllDatetimeFields();
    };
  }
}
