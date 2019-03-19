/**
 * toggleSidebar directive
 * @namespace linshare.external
 */
(function() {
  'use strict';

  angular
    .module('linshare.external')
    .directive('toggleSidebar', toggleSidebar);

  /**
   * @namespace toggleSidebar
   * @desc Show/Hide menu sidebar with 'burger' icon on mobile display
   * @example <li id="menu-trigger"
   *              data-toggle-sidebar
   *              data-toggle-model="mainVm.sidebarToggle"
   *          </li>
   * @memberOf linshare.external
   */
  function toggleSidebar(){

    var directive = {
      restrict: 'A',
      scope: {
        toggleModel: '='
      },
      link: linkFn
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc link function of the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} element - jqLite-wrapped element that this directive matches
     *  @memberOf LinShare.external.toggleSidebar
     */
    function linkFn(scope, element) {
      element.on('click', function(){
        if (scope.toggleModel === false) {
          scope.$apply(function(){
            scope.toggleModel = true;
          });
        }
        else {
          scope.$apply(function(){
            scope.toggleModel = false;
          });
        }
      });
    }
  }
})();
