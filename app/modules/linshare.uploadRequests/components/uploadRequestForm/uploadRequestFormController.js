angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestFormController', uploadRequestFormController);

uploadRequestFormController.$inject = [
  '$timeout',
  'formUtilsService',
  'lsAppConfig',
  'sidebarService',
  'toastService',
  'uploadRequestUtilsService'
];

function uploadRequestFormController(
  $timeout,
  formUtilsService,
  lsAppConfig,
  sidebarService,
  toastService,
  uploadRequestUtilsService
) {
  const uploadRequestFormVm = this;
  const { setSubmitted } = formUtilsService;
  const { onUpdateSuccess, onUpdateError } = sidebarService.getData();
  const { showToastAlertFor } = uploadRequestUtilsService;

  uploadRequestFormVm.$onInit = onInit;
  uploadRequestFormVm.onActivationDateChange = handleChangeOf('activationDate');
  uploadRequestFormVm.onExpiryDateChange = handleChangeOf('expiryDate');
  uploadRequestFormVm.onNotificationDateChange = handleChangeOf('notificationDate');
  uploadRequestFormVm.validateAllDatetimeFields = validateAllDatetimeFields;
  uploadRequestFormVm.enableEditValueOfDate = enableEditValueOfDate;
  uploadRequestFormVm.disableEditValueOfDate = disableEditValueOfDate;
  uploadRequestFormVm.enableEditActivationDate = true;
  uploadRequestFormVm.enableEditExpirationDate = true;
  uploadRequestFormVm.enableEditNotificationDate = true;

  function onInit() {
    if (sidebarService.getContent() === lsAppConfig.uploadRequestDetails) {
      sidebarService.addData('updateUploadRequest', updateUploadRequest);
    }
  }

  function updateUploadRequest() {
    validateAllDatetimeFields();

    if (!uploadRequestFormVm.form.$valid) {
      setSubmitted(uploadRequestFormVm.form);
      toastService.error({ key: 'UPLOAD_REQUESTS.FORM_CREATE.FORM_INVALID'});

      return;
    }

    uploadRequestFormVm.uploadRequestObject.update()
      .then(updated => {
        showToastAlertFor('update', 'info');

        return onUpdateSuccess && onUpdateSuccess(updated);
      })
      .catch(error => {
        showToastAlertFor('update', 'error');

        return onUpdateError && onUpdateError(error);
      });
  }

  function disableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestFormVm.uploadRequestObject.activationDate = undefined;
        uploadRequestFormVm.enableEditActivationDate = false;
        break;
      case 'expiryDate':
        uploadRequestFormVm.uploadRequestObject.expiryDate = undefined;
        uploadRequestFormVm.enableEditExpirationDate = false;
        break;
      case 'notificationDate':
        uploadRequestFormVm.uploadRequestObject.notificationDate = undefined;
        uploadRequestFormVm.enableEditNotificationDate = false;
        break;
    }

    validateAllDatetimeFields();
  }

  function enableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestFormVm.enableEditActivationDate = true;
        break;
      case 'expiryDate':
        uploadRequestFormVm.enableEditExpirationDate = true;
        break;
      case 'notificationDate':
        uploadRequestFormVm.enableEditNotificationDate = true;
        break;
    }

    uploadRequestFormVm.uploadRequestObject.setDefaultValueOfDate(dateType);
    validateAllDatetimeFields();
  }

  function validateAllDatetimeFields()  {
    $timeout(() => {
      uploadRequestFormVm.uploadRequestObject.calculateDatePickerOptions();

      if (
        uploadRequestFormVm.form.notificationDate &&
        uploadRequestFormVm.form.notificationDate.date &&
        uploadRequestFormVm.form.notificationDate.hour
      ) {
        uploadRequestFormVm.form.notificationDate.date.$validate();
        uploadRequestFormVm.form.notificationDate.hour.$validate();
      }

      if (
        uploadRequestFormVm.form.expiryDate &&
        uploadRequestFormVm.form.expiryDate.date &&
        uploadRequestFormVm.form.expiryDate.hour
      ) {
        uploadRequestFormVm.form.expiryDate.date.$validate();
        uploadRequestFormVm.form.expiryDate.hour.$validate();
      }

      if (
        uploadRequestFormVm.form.activationDate &&
        uploadRequestFormVm.form.activationDate.date &&
        uploadRequestFormVm.form.activationDate.hour
      ) {
        uploadRequestFormVm.form.activationDate.date.$validate();
        uploadRequestFormVm.form.activationDate.hour.$validate();
      }
    });
  }

  function handleChangeOf(dateType) {
    return value => {
      uploadRequestFormVm.uploadRequestObject[dateType] = value;
      validateAllDatetimeFields();
    };
  }
}
