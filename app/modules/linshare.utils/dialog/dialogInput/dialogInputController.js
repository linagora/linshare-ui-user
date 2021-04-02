angular
  .module('linshare.utils')
  .controller('dialogInputController', dialogInputController);

dialogInputController.$inject = ['$mdDialog', '$mdConstant', '$timeout'];

function dialogInputController($mdDialog, $mdConstant, $timeout) {
  const self = this;

  self.$onInit = () => {
    if (self.initialValue) {
      self.result = self.initialValue;

      $timeout(() => angular.element('.custom-dialog .md-input').trigger('select'));
    }
  };

  self.hide = function() {
    $mdDialog.hide(self.result);
  };
  self.abort = function() {
    $mdDialog.cancel();
  };
  self.keypress = function($event) {
    if ($event.keyCode === $mdConstant.KEY_CODE.ENTER) {
      $mdDialog.hide(self.result);
    }
  };
}