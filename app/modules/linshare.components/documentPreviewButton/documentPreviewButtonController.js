/**
 * DocumentPreviewButton Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('DocumentPreviewButtonController', DocumentPreviewButtonController);

  DocumentPreviewButtonController.$inject = [
    '_',
    '$mdDialog',
    'documentPreviewService'
  ];

  function DocumentPreviewButtonController(
    _,
    $mdDialog,
    documentPreviewService
  ) {
    var documentPreviewButtonVm = this;

    documentPreviewButtonVm.showDocumentPreviewDialog = showDocumentPreviewDialog;

    /**
     * @name showDocumentPreviewDialog
     * @desc Show mdDialog of the document preview
     * @param {Object} scope - Component current scope
     * @namespace linshare.components.documentPreviewButtonController
     */
    function showDocumentPreviewDialog(scope) {
      //TODO - PREVIEW: How to be pure?
      documentPreviewService.setItem(
        scope.itemIndex,
        scope.items
      );

      $mdDialog.show({
        // necessary by $mdDialog for binding locals to controller
        controller: angular.noop,
        bindToController: true,
        cancel: $mdDialog.hide,
        controllerAs: 'documentPreviewDialogVm',
        locals: {
          close: documentPreviewService.close,
          getItem: documentPreviewService.getItem,
          setNextItem: documentPreviewService.setNextItem,
          setPreviousItem: documentPreviewService.setPreviousItem,
          items: scope.items
        },
        onRemoving: documentPreviewService.resetItemIndex,
        template: require('./components/documentPreviewDialog/documentPreviewDialog.html')
      });
    }
  }
})();
