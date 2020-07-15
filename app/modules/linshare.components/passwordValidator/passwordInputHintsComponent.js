/**
 * PasswordInputHints Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('passwordInputHints', {
      template: require('./passwordInputHints.html'),
      controllerAs: 'passwordInputHintsVm',
      bindings: {
        formError: '<',
        rules: '<'
      }
    });
})();
