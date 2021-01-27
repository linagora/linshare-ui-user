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

  function onInit() {
    if (sidebarService.getContent() === lsAppConfig.uploadRequestDetails) {
      sidebarService.addData('updateUploadRequest', updateUploadRequest);
    }
  }

  function revalidateDateFields() {
    $timeout(() => {
      uploadRequestFormVm.form.notificationDate.$validate();
      uploadRequestFormVm.form.expirationDate.$validate();
      uploadRequestFormVm.form.activationDate.$validate();
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

          return onUpdateSuccess(updated);
        })
        .catch(error => {
          showToastAlertFor('update', 'error');

          return onUpdateError(error);
        });
    }
  }
}
