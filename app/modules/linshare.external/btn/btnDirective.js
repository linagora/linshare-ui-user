/**
 * btn directive
 * @namespace linshare.external
 */
(function() {
  'use strict';

  angular
    .module('linshare.external')
    .directive('btn', btn);

  btn.$inject = ['Waves'];

  /**
   * @namespace btn
   * @desc Apply waves effect on button element
   * @example <button class="btn"></button>
   * @memberOf linshare.external
   */
  function btn(Waves){

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
     *  @memberOf LinShare.external.btn
     */
    function linkFn(scope, element) {
      if(element.hasClass('btn-icon') || element.hasClass('btn-float')) {
        Waves.attach(element, ['waves-circle']);
      }
      else if(element.hasClass('btn-light')) {
        Waves.attach(element, ['waves-light']);
      }
      else {
        Waves.attach(element);
      }

      Waves.init();
    }
  }
})();
