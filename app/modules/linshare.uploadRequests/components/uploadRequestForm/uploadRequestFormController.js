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

  uploadRequestFormVm.revalidateDateFields = revalidateDateFields;
  uploadRequestFormVm.$onInit = onInit;
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

  function revalidateDateFields() {
    $timeout(() => {
      if (uploadRequestFormVm.form.notificationDate) {
        uploadRequestFormVm.form.notificationDate.$validate();
      }

      if (uploadRequestFormVm.form.expirationDate) {
        uploadRequestFormVm.form.expirationDate.$validate();
      }

      if (uploadRequestFormVm.form.activationDate) {
        uploadRequestFormVm.form.activationDate.$validate();
      }
    });
  }

  function updateUploadRequest() {
    if (!uploadRequestFormVm.form.$valid) {
      setSubmitted(uploadRequestFormVm.form);
      toastService.error({ key: 'UPLOAD_REQUESTS.FORM_CREATE.FORM_INVALID'});
    } else {
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
  }

  function disableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestFormVm.uploadRequestObject.activationDate = undefined;
        uploadRequestFormVm.enableEditActivationDate = false;
        break;
      case 'expirationDate':
        uploadRequestFormVm.uploadRequestObject.expiryDate = undefined;
        uploadRequestFormVm.enableEditExpirationDate = false;
        break;
      case 'notificationDate':
        uploadRequestFormVm.uploadRequestObject.notificationDate = undefined;
        uploadRequestFormVm.enableEditNotificationDate = false;
        break;
    }

    uploadRequestFormVm.uploadRequestObject.calculateDatePickerOptions();
    revalidateDateFields();
  }

  function enableEditValueOfDate(dateType) {
    switch (dateType) {
      case 'activationDate':
        uploadRequestFormVm.enableEditActivationDate = true;
        break;
      case 'expirationDate':
        uploadRequestFormVm.enableEditExpirationDate = true;
        break;
      case 'notificationDate':
        uploadRequestFormVm.enableEditNotificationDate = true;
        break;
    }

    uploadRequestFormVm.uploadRequestObject.setDefaultValueOfDate(dateType);
    uploadRequestFormVm.uploadRequestObject.calculateDatePickerOptions();
    revalidateDateFields();
  }
}
