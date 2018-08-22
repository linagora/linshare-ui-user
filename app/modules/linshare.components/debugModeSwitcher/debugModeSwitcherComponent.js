/**
 * debugModeSwitcher Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('debugModeSwitcher', {
      templateUrl: templateUrl,
      controller: 'DebugModeSwitcherController',
      controllerAs: 'debugModeSwitcherVm',
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.debugModeSwitcher.components.debugModeSwitcher
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path + 'debugModeSwitcher/debugModeSwitcher.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
