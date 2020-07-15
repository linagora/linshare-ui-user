/**
 * sidebarAuditActionsTab Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('sidebarAuditActionsTab', {
      template: require('./sidebarAuditActionsTab.html'),
      controller: 'sidebarAuditActionsTabController',
      controllerAs: 'sidebarAuditActionsTabVm',
      bindings: {
        uuid: '<',
        type: '<'
      }
    });
})();
