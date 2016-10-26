(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('linshareSidebar', linshareSidebar);

  linshareSidebar.$inject = ['LinshareSidebarController'];

  //TODO: unused for now, move sidebar element from UiUserMainController
  function linshareSidebar(LinshareSidebarController) {
    return {
      restrict: 'E',
      templateUrl: '',
      scope: {
        toggle: '=',
        dataType: '='
      },
      link: linkFunc,
      controller: LinshareSidebarController,
      controllerAs: 'linshareSidebarVm',
      bindToController: true
    };

    function linkFunc(scope, element, attrs, exampleVm, transcludeFn) {

    }
  }
})();
