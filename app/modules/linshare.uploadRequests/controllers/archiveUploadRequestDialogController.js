angular
  .module('linshare.uploadRequests')
  .controller('archiveUploadRequestDialogController', archiveUploadRequestDialogController);

archiveUploadRequestDialogController.$inject = ['$mdDialog', '$mdConstant', '$timeout'];

function archiveUploadRequestDialogController($mdDialog) {
  const self = this;

  self.copyFiles = true;

  self.hide = function() {
    $mdDialog.hide(self.copyFiles);
  };
  self.abort = function() {
    $mdDialog.cancel();
  };
}