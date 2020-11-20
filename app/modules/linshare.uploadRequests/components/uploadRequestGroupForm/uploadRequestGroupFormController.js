angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupFormController', uploadRequestGroupFormController);

function uploadRequestGroupFormController() {
  const uploadRequestGroupFormVm = this;

  uploadRequestGroupFormVm.$onInit = onInit;

  function onInit() {
    uploadRequestGroupFormVm.selectedTabIndex = uploadRequestGroupFormVm.selectedTabIndex || 0;
  }
}
