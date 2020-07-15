/**
 * newUploadBounce Directive
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('newUploadBounce', newUploadBounceDirective);

  /**
   *  @namespace newUploadBounceDirective
   *  @desc Make an animation when a file is added to upload queue
   *  @memberOf linshareUiUserApp
   */
  function newUploadBounceDirective() {
    return {
      restrict: 'A',
      link: linkFunc
    };
  }

  /**
   *  @namespace linkFunc
   *  @desc Link function of newUploadBounce Directive
   *  @param {Object} scope - Angular scope object of the directive
   *  @param {Object} elem - jqLite-wrapped element that this directive matches
   *  @memberOf linshareUiUserApp
   */
  function linkFunc(scope, elem) {
    scope.$on('flow::filesSubmitted', function() {
      elem.show(0, function() {
        elem.addClass('active-anim-transfert-icon');
      }).delay(3000).hide(0, function() {
        elem.removeClass('active-anim-transfert-icon');
      });
    });
  }
})();

