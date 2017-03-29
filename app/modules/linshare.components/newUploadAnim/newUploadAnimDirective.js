/**
 * newUploadAnim Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('newUploadAnim', newUploadAnim);

  /**
   * @namespace newUploadAnim
   * @desc Directive for managing animation when adding element on the table
   * @example <tr ... new-upload-anim></tr>
   * @memberOf linshare.components
   */
  function newUploadAnim() {
    var directive = {
      restrict: 'A',
      link: linkFn
    };
    return directive;

    /**
     *  @name linkFn
     *  @desc DOM manipulation function, relared to the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} element - jqLite-wrapped element that this directive matches
     *  @memberOf linshare.components.newUploadAnimDirective
     */
    function linkFn(scope, element) {
      if (scope.isNewAddition) {
        angular.element(element).addClass('set-hidden-anim').delay(200).queue(function() {
          $(this).addClass('anim-in');
        });
        scope.isNewAddition = false;
      }
    }
  }
})();
