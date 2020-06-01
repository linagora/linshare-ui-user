/**
 * PasswordInputHints Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('passwordInputHints', {
      templateUrl: templateUrl,
      controllerAs: 'passwordInputHintsVm',
      bindings: {
        formError: '<',
        rules: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.PasswordInputHints
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path + 'passwordValidator/passwordInputHints.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
