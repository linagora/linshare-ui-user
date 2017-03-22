/**
 * fabButton Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('fabButton', fabButton);

  fabButton.$inject = ['$timeout', 'componentsConfig'];

  /**
   * @namespace fabButton
   * @desc Fab button displayed in mobile view
   * @example <div fab-button
   *               fab-button-actions="fabButton.actions"
   *               fab-button-flow="$flow"
   *               fab-button-toolbar="fabButton.toolbar">
   *          </div>
   * @memberOf linshare.components
   */
  function fabButton($timeout, componentsConfig) {
    var directive = {
      restrict: 'A',
      templateUrl: componentsConfig.path + 'fabButton/fabButtonTemplate.html',
      scope: {
        $flow: '=?fabButtonFlow',
        /*
         * @property {Array<Object>} fabButtonActions - List of actions to set in the fab button
         * @property {function|string} fabButtonActions.action - Either a function to be called or a route name
         * @property {string} fabButtonActions.label - Label of the actions
         * @property {string} fabButtonActions.icon - Class name of the icon
         * @property {boolean} fabButtonActions.flowBtn - Determine if directive 'flow-btn' should be applied
         * @property {boolean} fabButtonActions.disabled - Determine if element should be disabled
         * @property {boolean} fabButtonActions.hide - Determine if element should be hidden
         */
        fabButtonActions: '=',
        /*
         * @property {Object} fabButtonToolbar - Define toolbar on fab button
         * @property {boolean} fabButtonToolbar.activate - Determine if the toolbar should be activated
         * @property {string} fabButtonToolbar.label - Label of the toolbar
         */
        fabButtonToolbar: '=?'
      },
      link: linkFn
    };

    return directive;

    ////////////

    /**
     *  @name linkFn
     *  @desc DOM manipulation function, relared to the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} elm - jqLite-wrapped element that this directive matches
     *  @memberOf linshare.components.fabButton
     */
    function linkFn(scope, elm) {
      attachToBody();

      scope.fab = {
        isOpen: false,
        selectedDirection: 'left'
      };

      scope.isDoubleRowFab = countShownElement() > 3;

      scope.$watch('fab.isOpen', function(isOpen) {
        if (isOpen) {
          angular.element('.md-toolbar-tools').addClass('setWhite');
          angular.element('.multi-select-mobile').addClass('setDisabled');
          angular.element('#overlayMobileFab').addClass('toggledMobileShowOverlay');
          angular.element('#content-container').addClass('setDisabled');
          if (scope.isDoubleRowFab) {
            angular.element('#overlayMobileFab').addClass('double-row-fab');
          }
        } else {
          angular.element('.md-toolbar-tools').removeClass('setWhite');
          angular.element('.multi-select-mobile').removeClass('setDisabled');
          angular.element('#overlayMobileFab').removeClass('toggledMobileShowOverlay');
          angular.element('#content-container').removeClass('setDisabled');
          if (scope.isDoubleRowFab) {
            angular.element('#overlayMobileFab').removeClass('double-row-fab');
          }
        }
      });

      scope.$on('$destroy', function(data) {
        data.currentScope.fabDOM.detach();
      });

      ////////////

      /**
       * @name attachToBody
       * @desc Append the fab button directly to the <body>
       * @memberOf linshare.components.fabButton.linkFn
       */
      function attachToBody() {
        scope.fabDOM = angular.element(elm[0]);
        scope.fabDOM.detach();
        angular.element('body').append(scope.fabDOM);
      }
      /**
       * @name countShownElement
       * @desc Count the number of activated action in the fab toolbar
       * @returns {number} Number of activated action
       * @memberOf linshare.components.fabButton.linkFn
       */
      function countShownElement() {
        var count = 0;
        _.forEach(scope.fabButtonActions, function(action) {
          if (_.isUndefined(action.hide)) {
            count++;
          }
        });
        return count;
      }
    }
  }
})();
