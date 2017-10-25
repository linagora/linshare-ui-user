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
   *              data-target="mainmenu"
   *              data-toggle-sidebar
   *              data-model-left="mactrl.sidebarToggle.left"
   *          </li>
   * @memberOf linshare.external
   */
  function toggleSidebar(){

    var directive = {
      restrict: 'A',
      scope: {
        modelLeft: '=',
        modelRight: '='
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
        if (element.data('target') === 'mainmenu') {
          if (scope.modelLeft === false) {
            scope.$apply(function(){
              scope.modelLeft = true;
            });
          }
          else {
            scope.$apply(function(){
              scope.modelLeft = false;
            });
          }
        }
        if (element.data('target') === 'chat') {
          if (scope.modelRight === false) {
            scope.$apply(function(){
              scope.modelRight = true;
            });
          }
          else {
            scope.$apply(function(){
              scope.modelRight = false;
            });
          }
        }
      });
    }
  }
})();
