/**
 * preventDefault directive
 * @namespace linshare.directive
 */
(function() {
  'use strict';

  angular
    .module('linshare.directives')
    .directive('preventDefault', preventDefault);

  /**
   * @namespace preventDefault
   * @desc Prevent event default
   * @example <div class="prevent-default"></div>
   * @memberOf linshare.directives
   */
  function preventDefault(){
    var directive = {
      restrict: 'C',
      link: linkFn
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc link function of the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} element - jqLite-wrapped element that this directive matches
     *  @memberOf LinShare.directives.preventDefault
     */
    function linkFn(scope, element) {
      element.on('click', function(event){
        event.preventDefault();
      });
    }
  }
})();
