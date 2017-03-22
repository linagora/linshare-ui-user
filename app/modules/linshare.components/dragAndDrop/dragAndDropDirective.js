/**
 * dragAndDrop Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('dragAndDrop', dragAndDrop);

  dragAndDrop.$inject = ['componentsConfig'];

  /**
   * @namespace dragAndDrop
   * @desc Directive for managing drag and drop of files
   * @example <div drag-and-drop
   *               drag-and-drop-submitted="onSubmittedAction()"
   *               drag-and-drop-success="onSuccessAction()">
   *          </div>
   * @memberOf linshare.components
   */
  function dragAndDrop(componentsConfig) {
    var directive = {
      restrict: 'A',
      templateUrl: componentsConfig.path + 'dragAndDrop/dragAndDropTemplate.html',
      scope: {
        $flow: '=dragAndDropFlow',
        submitted: '&dragAndDropSubmitted',
        success: '&dragAndDropSuccess'
      },
      transclude: true,
    };

    return directive;
  }
})();
