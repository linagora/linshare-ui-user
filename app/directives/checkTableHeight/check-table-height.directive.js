/**
 * checkTableHeight Directive
 * @namespace LinShare.components
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('checkTableHeight', checkTableHeight);

  checkTableHeight.$inject = ['$rootScope', '$timeout'];

  /**
   *  @namespace checkTableHeight
   *  @desc check and set the window height and width when the window resize
   *  @example <tr check-table-height></tr>
   *  @memberOf linshareUiUserApp
   */
  function checkTableHeight($rootScope, $timeout) {
    var directive = {
      restrict: 'A',
      controller: 'CheckTableHeightController',
      controllerAs: 'checkTableHeightVm',
      link: linkFn
    };

    return directive;

    /** 
     *  @name linkFn 
     *  @desc link function of the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} elm - jqLite-wrapped element that this directive matches
     *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
     *  @param {Object} form - Directive's required controller instance(s)
     *  @memberOf LinShare.components.lsAutocompleteUsers
     */
    function linkFn(scope, element, attrs, checkTableHeightVm) {
      scope.$on('$stateChangeSuccess', function() {
        checkTableHeightVm.checkAndSetNewWidth(scope.mactrl.sidebarToggle.left);
        checkTableHeightVm.checkAndSetNewWidthSidebarRight();
        checkTableHeightVm.resizeTableBody();
      });

      angular.element(window).resize(function() {
        checkTableHeightVm.checkAndSetNewWidth(scope.mactrl.sidebarToggle.left);
        checkTableHeightVm.checkAndSetNewWidthSidebarRight();
        checkTableHeightVm.resizeTableBody();
      });

      scope.$watch(function($window) {
        return $window.innerWidth;
      }, function() {
        checkTableHeightVm.checkAndSetNewWidth(scope.mactrl.sidebarToggle.left);
        $timeout(function() {
          checkTableHeightVm.resizeTableBody();
        }, 450);
      });

      scope.$watch(function($window) {
        return $window.innerHeight;
      }, function() {
        checkTableHeightVm.resizeTableBody();
        $timeout(function() {
          checkTableHeightVm.resizeTableBody();
        }, 1000);
      });
    }
  }
})();
