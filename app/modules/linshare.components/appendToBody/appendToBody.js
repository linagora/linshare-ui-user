/**
 * appendToBody Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('appendToBody', appendToBody);

  /**
   * @namespace appendToBody
   * @desc Directive for appending the element to body, rather than at his initial place
   * @example <div class="append-to-body"></div>
   * @memberOf linshare.components
   */
  function appendToBody() {
    var directive = {
      restrict: 'C',
      link: linkFn
    };

    return directive;
  }

  /**
   *  @name linkFn
   *  @desc DOM manipulation function, related to the directive
   *  @param {Object} scope - Angular scope object of the directive
   *  @param {Object} elm - jqLite-wrapped element that this directive matches
   *  @memberOf linshare.components.appendToBody
   */
  function linkFn(scope, elm) {
    angular.element(elm).appendTo('body');
    scope.$on('$destroy', function() {
      elm.detach();
    });
  }
})();
