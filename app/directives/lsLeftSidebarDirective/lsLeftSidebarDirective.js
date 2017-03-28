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
      link: linkFunc,
      templateUrl: 'views/common/sidebar.html',
      replace: false
    };
  }

  /**
   * @name linkFn
   * @desc link function of the directive
   * @param {Object} scope - Angular scope object of the directive
   * @param {Object} elm - jqLite-wrapped element that this directive matches
   * @param {Object} attrs - Normalized attribute names and their corresponding attribute values
   * @param {Object} ctrl - Directive's required controller instance(s)
   * @memberOf linshareUiUserApp.lsLeftSidebar
   */
  function linkFunc(scope, elm, attrs, ctrl) {
    var heightWindow = angular.element(window).outerHeight();
    var heightHeader = angular.element('#header').outerHeight();
    var sidebarProfileHeight = angular.element('#userNameSidebar').outerHeight();
    var sidebarQuotaHeight = angular.element('.quota').outerHeight();
    var navRemainingSize = heightWindow - heightHeader - sidebarProfileHeight - sidebarQuotaHeight;
    scope.sizeNavigation = {'height': navRemainingSize + 'px'};
    ctrl.$timeout(function() {
      scope.sizeNavigation = {'height': navRemainingSize + 'px'};
    }, 0);
  }
})();
