
/**
 * DocumentPreviewNavigation Controller
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('DocumentPreviewNavigationController', DocumentPreviewNavigationController);

  DocumentPreviewNavigationController.$inject = ['documentPreviewService'];

  function DocumentPreviewNavigationController(documentPreviewService) {
    var documentPreviewNavigationVm = this;

    documentPreviewNavigationVm.$onChanges = $onChanges;
    documentPreviewNavigationVm.$postLink = $postLink;
    documentPreviewNavigationVm.$onDestroy = $onDestroy;
    documentPreviewNavigationVm.setPreviousItem = documentPreviewService.setPreviousItem;
    documentPreviewNavigationVm.setNextItem =  documentPreviewService.setNextItem;

    ////////////

    /**
     * @name $onChanges
     * @desc Called whenever one-way bindings are updated
     * @memberOf linshare.components.documentPreviewButton.components.DocumentPreviewNavigationController
     */
    function $onChanges() {
      documentPreviewNavigationVm.item = Object.assign(
        {},
        documentPreviewNavigationVm.item,
        documentPreviewService.getItem()
      );
    }

    /**
     * @name $postLink
     * @desc Called after this controller's element and its children have been linked
     * @memberOf linshare.components.documentPreviewButton.components.DocumentPreviewNavigationController
     */
    function $postLink() {
      angular
        .element(document)
        .bind('keydown', setupKeyboardNavigation);
    }

    /**
     * @name $onDestroy
     * @desc Called on a controller when its containing scope is destroyed
     * @memberOf linshare.components.documentPreviewButton.components.DocumentPreviewNavigationController
     */
    function $onDestroy() {
      angular
        .element(document)
        .unbind('keydown', setupKeyboardNavigation);
    }

    /**
     * @name setupKeyboardNavigation
     * @desc Setup keyboard right & left arrow to handle navigation between items
     * @memberOf linshare.components.documentPreviewButton.components.DocumentPreviewNavigationController
     */
    function setupKeyboardNavigation(event) {
        var arrowLeft = 37;
        var arrowRight = 39;
        var method;

        if (event.which === arrowRight && !documentPreviewNavigationVm.item.isLastItem) {
          method = documentPreviewNavigationVm.setNextItem;
        }

        if (event.which === arrowLeft && !documentPreviewNavigationVm.item.isFirstItem) {
          method = documentPreviewNavigationVm.setPreviousItem;
        }

        if (method) {
          event.preventDefault();
          method(
            documentPreviewNavigationVm.item,
            documentPreviewNavigationVm.items
          );
        }
      }
    }
})();
