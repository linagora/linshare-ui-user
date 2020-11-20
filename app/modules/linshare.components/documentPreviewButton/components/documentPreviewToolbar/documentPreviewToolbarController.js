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
    'documentPreviewService',
    'functionalityRestService'
  ];

  function DocumentPreviewToolbarController(
    _,
    $timeout,
    documentPreviewService,
    functionalityRestService
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
    documentPreviewToolbarVm.TYPE_FOLDER = 'FOLDER';

    ////////////

    /**
     * @name $onInit
     * @desc Initialization function of the component
     * @namespace linshare.components.documentPreviewButton.components.DocumentPreviewToolbarController
     */
    function $onInit() {
      documentPreviewToolbarVm.canCopyToMySpace = !_.isNil(documentPreviewService.copyToMySpace);

      functionalityRestService.getFunctionalityParams('WORK_GROUP').then(functionality => {
        if (functionality && functionality.enable) {
          documentPreviewToolbarVm.canCopyToWorkGroup = !_.isNil(documentPreviewService.copyToWorkgroup);
        } else {
          documentPreviewToolbarVm.canCopyToWorkGroup = false;
        }
      });
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
