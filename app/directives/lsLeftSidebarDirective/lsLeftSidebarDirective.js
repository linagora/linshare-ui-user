/**
 * lsLeftSidebar Directive
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('lsLeftSidebar', lsLeftSidebar);

  /**
   * @namespace lsLeftSidebar
   * @desc Manage left sidebar's components and design
   * @memberOf linshareUiUserApp
   */
  function lsLeftSidebar() {
    return {
      restrict: 'A',
      transclude: true,
      scope: false,
      controller: 'lsLeftSidebarController',
      controllerAs: 'lsLeftSidebarVm',
      templateUrl: 'views/common/sidebar.html',
      replace: false
    };
  }

})();
