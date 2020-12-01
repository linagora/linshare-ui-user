angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupFormController', uploadRequestGroupFormController);

uploadRequestGroupFormController.$inject = ['$timeout'];

function uploadRequestGroupFormController($timeout) {
  const uploadRequestGroupFormVm = this;

  uploadRequestGroupFormVm.$onInit = onInit;
  uploadRequestGroupFormVm.revalidateDateFields = revalidateDateFields;

  function onInit() {
    uploadRequestGroupFormVm.selectedTabIndex = uploadRequestGroupFormVm.selectedTabIndex || 0;
  }

  function revalidateDateFields() {
    $timeout(() => {
      uploadRequestGroupFormVm.form.notificationDate.$validate();
      uploadRequestGroupFormVm.form.expirationDate.$validate();
      uploadRequestGroupFormVm.form.activationDate.$validate();
    });
  }
}
