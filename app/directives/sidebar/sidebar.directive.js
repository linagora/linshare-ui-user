/**
 * linshareSidebar Directive
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('linshareSidebar', linshareSidebar);

  linshareSidebar.$inject = ['LinshareSidebarController'];

  /**
   *  @namespace linshareSidebar
   *  @desc TODO [TOFILL]
   *  @param {Object} LinshareSidebarController controller of the sidebar
   *  @memberOf linshareUiUserApp
   */
  //TODO: unused for now, move sidebar element from UiUserMainController
  function linshareSidebar(LinshareSidebarController) {
    return {
      restrict: 'E',
      templateUrl: '',
      scope: {
        toggle: '=',
        dataType: '='
      },
      controller: LinshareSidebarController,
      controllerAs: 'linshareSidebarVm',
      bindToController: true
    };
  }
})();
