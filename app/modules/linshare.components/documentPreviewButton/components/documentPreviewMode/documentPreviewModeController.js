/**
 * DocumentPreviewMode Controller
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('DocumentPreviewModeController', DocumentPreviewModeController);

  DocumentPreviewModeController.$inject = ['documentPreviewService'];

  function DocumentPreviewModeController(documentPreviewService) {
    var documentPreviewModeVm = this;

    documentPreviewModeVm.$onChanges = $onChanges;

    ////////////

    /**
     * @name $onChanges
     * @desc Called whenever one-way bindings are updated
     * @param {Object} changes - Hash whose keys are the names of the bound properties that have changed,
     *                           and the values are an object of the form
     *                           { currentValue, previousValue, isFirstChange() }
     * @param {Object.number} index - Current item index
     * @memberOf linshare.components.documentPreviewButton.components.DocumentPreviewModeController
     */
    function $onChanges(changes) {
      if (!changes.index.isFirstChange()) {
        documentPreviewModeVm.item =  Object.assign(
          {},
          documentPreviewModeVm.item,
          documentPreviewService.getItem()
        );
      }
    }
  }
})();
