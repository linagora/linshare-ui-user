angular
  .module('linshare.token')
  .controller('createdTokenDialogController', createdTokenDialogController);

createdTokenDialogController.$inject = ['$mdDialog'];

function createdTokenDialogController($mdDialog) {
  const self = this;

  self.hide = function() {
    $mdDialog.cancel();
  };
}