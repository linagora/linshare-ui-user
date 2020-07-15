/**
 * dragAndDrop Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('dragAndDrop', dragAndDrop);

  /**
   * @namespace dragAndDrop
   * @desc Directive for managing drag and drop of files
   * @example <div drag-and-drop
   *               drag-and-drop-submitted="onSubmittedAction()"
   *               drag-and-drop-success="onSuccessAction()">
   *          </div>
   * @memberOf linshare.components
   */
  function dragAndDrop() {
    var directive = {
      restrict: 'A',
      template: require('./dragAndDropTemplate.html'),
      scope: {
        $flow: '=dragAndDropFlow',
        enabled: '=dragAndDropEnabled',
        submitted: '&dragAndDropSubmitted',
        added: '&dragAndDropAdded',
        success: '&dragAndDropSuccess'
      },
      transclude: true
    };

    return directive;
  }
})();
