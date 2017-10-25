/**
 * stopPropagate directive
 * @namespace linshare.external
 */
(function() {
  'use strict';

  angular
    .module('linshare.external')
    .directive('stopPropagate', stopPropagate);

  /**
   * @namespace stopPropagate
   * @desc Stop event propagation
   * @example <div class="stop-propagate"></div>
   * @memberOf linshare.external
   */
  function stopPropagate(){

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
     *  @memberOf LinShare.external.stopPropagate
     */
    function linkFn(scope, element) {
      element.on('click', function(event){
        event.stopPropagation();
      });
    }
  }
})();
