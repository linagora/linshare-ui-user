/**
 * sidebarAuditActionsTab Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('sidebarAuditActionsTab', {
      templateUrl: templateUrl,
      controller: 'sidebarAuditActionsTabController',
      controllerAs: 'sidebarAuditActionsTabVm',
      bindings: {
        uuid: '<',
        type: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.sidebarAuditActionsTab
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path + 'sidebar/sidebarAuditActionsTab.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
