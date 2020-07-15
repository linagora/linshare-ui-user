/**
 * fabLink Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('fabLink', fabLink);

  fabLink.$inject = ['_'];

  /**
   * @namespace fabLink
   * @desc Link element inside fab toolbar
   * @example <fab-link
   *                fab-link-action="action.action"
   *                fab-link-icon="action.icon"
   *                fab-link-label="action.label">
   *           </fab-link>
   * @memberOf linshare.components
   */
  function fabLink(_) {
    var directive = {
      restrict: 'E',
      template: require('./fabLinkTemplate.html'),
      scope: {
        fabLinkAction: '=',
        fabLinkIcon: '=',
        fabLinkLabel: '='
      },
      link: linkFn
    };

    return directive;

    ////////////

    /**
     *  @name linkFn
     *  @desc DOM manipulation function, relared to the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @memberOf linshare.components.fabLink
     */
    function linkFn(scope) {
      scope._ = _;
    }
  }
})();
