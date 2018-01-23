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
     * @memberOf linshare.components.documentPreviewButton.components.DocumentPreviewModeController
     */
    function $onChanges() {
      documentPreviewModeVm.item =  Object.assign(
        {},
        documentPreviewModeVm.item,
        documentPreviewService.getItem()
      );
      documentPreviewModeVm.documentMimeType = documentPreviewModeVm.item.mimeType || documentPreviewModeVm.item.type;
    }
  }
})();
