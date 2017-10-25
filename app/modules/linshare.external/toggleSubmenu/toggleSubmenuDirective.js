/**
 * toggleSubmenu directive
 * @namespace linshare.external
 */
(function() {
  'use strict';

  angular
    .module('linshare.external')
    .directive('toggleSubmenu', toggleSubmenu);

  /**
   * @namespace toggleSubmenu
   * @desc Slider for links menu to show child links
   * @example <div class="stop-propagate"></div>
   * @memberOf linshare.external
   */
  function toggleSubmenu(){

    var directive = {
      restrict: 'A',
      link: linkFn
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc link function of the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} element - jqLite-wrapped element that this directive matches
     *  @memberOf LinShare.external.toggleSubmenu
     */
    function linkFn(scope, element) {
      element.click(function(){
        element.next().slideToggle(200);
        element.parent().toggleClass('toggled');
      });
    }
  }
})();
