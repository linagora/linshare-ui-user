/**
 * DocumentPreviewToolbar Controller
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('DocumentPreviewToolbarController', DocumentPreviewToolbarController);

  DocumentPreviewToolbarController.$inject = [
    '_',
    '$timeout',
    'documentPreviewService'
  ];

  function DocumentPreviewToolbarController(
    _,
    $timeout,
    documentPreviewService
  ) {
    var documentPreviewToolbarVm = this;

    documentPreviewToolbarVm.$onInit = $onInit;
    documentPreviewToolbarVm.$onChanges = $onChanges;
    documentPreviewToolbarVm.close = documentPreviewService.close;
    documentPreviewToolbarVm.copyToMySpace = documentPreviewService.copyToMySpace;
    documentPreviewToolbarVm.copyToWorkgroup = documentPreviewService.copyToWorkgroup;
    documentPreviewToolbarVm.download = documentPreviewService.download;
    documentPreviewToolbarVm.executeAndClose = documentPreviewService.executeAndClose;
    documentPreviewToolbarVm.showItemDetails = documentPreviewService.showItemDetails;

    ////////////

    /**
     * @name $onInit
     * @desc Initialization function of the component
     * @namespace linshare.components.documentPreviewButton.components.DocumentPreviewToolbarController
     */
    function $onInit() {
      documentPreviewToolbarVm.canCopyToMySpace = !_.isNil(documentPreviewService.copyToMySpace);
      documentPreviewToolbarVm.canCopyToWorkgroup = !_.isNil(documentPreviewService.copyToWorkgroup);
    }

    /**
     * @name $onChanges
     * @desc Called whenever one-way bindings are updated
     * @namespace linshare.components.documentPreviewButton.components.DocumentPreviewToolbarController
     */
    function $onChanges() {
      documentPreviewToolbarVm.item = Object.assign(
        {},
        documentPreviewToolbarVm.item,
        documentPreviewService.getItem()
      );
    }
  }
})();
