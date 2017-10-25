/**
 * fgLine directive
 * @namespace linshare.external
 */
(function() {
  'use strict';

  angular
    .module('linshare.external')
    .directive('fgLine', fgLine);

  fgLine.$inject=['$'];

  /**
   * @namespace fgLine
   * @desc Add blue animated border and move up label on focus and reset label on blur
   * @example <div class="fg-line">
   *            <input type="text" class="form-control fg-input" name="potato">
   *            <label class="fg-label" for="potato">Super potato</label>
   *          </div>
   * @memberOf linshare.external
   */
  function fgLine($){

    var directive = {
      restrict: 'C',
      link: linkFn
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc link function of the directive
     *  @memberOf LinShare.external.fgLine
     */
    function linkFn() {
      if($('.fg-line')[0]) {
        $('body').on('focus', '.form-control', function(){
          $(this).closest('.fg-line').addClass('fg-toggled');
        });

        $('body').on('blur', '.form-control', function(){
          var p = $(this).closest('.form-group');
          var i = p.find('.form-control').val();

          if (p.hasClass('fg-float')) {
            if (i.length === 0) {
              $(this).closest('.fg-line').removeClass('fg-toggled');
            }
          }
          else {
            $(this).closest('.fg-line').removeClass('fg-toggled');
          }
        });
      }
    }
  }
})();
