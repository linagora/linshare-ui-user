/**
 * formControl directive
 * @namespace linshare.external
 */
(function() {
  'use strict';

  angular
    .module('linshare.external')
    .directive('formControl', formControl);

  formControl.$inject=['$'];

  /**
   * @namespace formControl
   * @desc Placeholder for IE9  -> .form-control
   * @example <textarea class="form-control" placeholder="myPlaceHolder"></textarea>
   * @memberOf linshare.external
   */
  function formControl($){

    var directive = {
      restrict: 'C',
      link: linkFn
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc link function of the directive
     *  @memberOf LinShare.external.formControl
     */
    function linkFn() {
      if(angular.element('html').hasClass('ie9')) {
        $('input, textarea').placeholder({
          customClass: 'ie9-placeholder'
        });
      }
    }
  }
})();
