/**
 * documentPreviewService Factory
 * @namespace linshare.components.documentPreviewButton
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .service('documentPreviewService', documentPreviewService);

  documentPreviewService.$inject = [
    '_',
    '$mdDialog'
  ];

  /**
   * @namespace documentPreviewService
   * @desc Service to manage document preview component
   * @memberOf linshare.components
   */
  function documentPreviewService(
    _,
    $mdDialog
  ) {
    var service = {
      _item: {},
      close: close,
      copyToMySpace: undefined,
      copyToWorkgroup: undefined,
      download: undefined,
      executeAndClose: executeAndClose,
      getItem: getItem,
      getPreviewMode: getPreviewMode,
      setItem: setItem,
      resetItemIndex: resetItemIndex,
      setNextItem: setNextItem,
      setPreviousItem: setPreviousItem,
      showItemDetails: undefined
    };

    return service;

    ////////////

    /**
     * @name close
     * @desc Trigger action to close the preview
     * @param {Object} item - Document type object which shall contains: index, hasThumbnail, thumbNailUrl?
     * @return {Promise<Object>} Promise return by $mdDialog.hide()
     * @memberOf linshare.components.documentPreviewButton.services.documentPreviewService
     */
    function close(item) {
      service._item = undefined;

      return $mdDialog.hide(item);
    }

    /**
     * @name executeAndClose
     * @desc Trigger action to execute a callback with given item and close the preview
     * @param {Object} item - Document type object which shall contains: index, hasThumbnail, thumbNailUrl?
     * @param {Function} callback - A function to be executed
     * @return {Promise<Object>} Promise return by close()
     * @memberOf linshare.components.documentPreviewButton.services.documentPreviewService
     */
    function executeAndClose(item, callback) {
      callback(item);

      return close(item);
    }

    /**
     * @name getItem
     * @desc Retrieve the current item showed in the preview
     * @return {Object} The current item being showed in the preview
     * @memberOf linshare.components.documentPreviewButton.services.documentPreviewService
     */
    function getItem() {
      return service._item;
    }

    /**
     * Contains mode to be activated for the preview
     * @typedef {Object} PreviewMode
     * @property {boolean} image - Determine if the `image` mode shall be activated
     * @property {boolean} noPreview - Determine if the `no preview` mode shall be activated
     * @property {boolean} pdf - Determine if the `pdf` mode shall be activated
     */
    /**
     * @name GetPreviewMode
     * @desc Get the mode of the preview depending on the item given
     * @param {Object} item - Document type object which shall contains: index, mode, preview
     * @return {PreviewMode} preview mode activation
     * @namespace linshare.components.documentPreviewButtonController
     */
    function getPreviewMode(item) {
      var documentMimeType = item.mimeType || item.type;
      var previewMode = {
        image: false,
        noPreview: false,
        other: false,
        pdf: false
      };

      if (!item.hasThumbnail) {
        previewMode.noPreview = true;
      } else {
        if (documentMimeType.indexOf('image/') !== -1) {
          previewMode.image = true;
        }

        if (documentMimeType.indexOf('application/pdf') !== -1) {
          previewMode.pdf = true;
        }

        if (documentMimeType.indexOf('application/pdf') === -1 && documentMimeType.indexOf('image/') === -1) {
          previewMode.other = true;
        }
      }

      return previewMode;
    }

    /**
     * @name reset
     * @desc Reset the item index to -1
     * @memberOf linshare.components.documentPreviewButton.services.documentPreviewService
     */
    function resetItemIndex() {
      service._item = Object.assign(
        {},
        service._item,
        {
          index: -1
        }
      );
    }

    /**
     * @name setItem
     * @desc Set the current item to be showed in the preview
     * @param {number} itemIndex - Index of the item to be setted
     * @param {Array<Object>} items - List of items currently handled by the preview
     * @memberOf linshare.components.documentPreviewButton.services.documentPreviewService
     */
    function setItem(itemIndex, items) {
      var item = items[itemIndex];
      var mode = service.getPreviewMode(item);

      item
        .getPreview(mode)
        .then(function(preview) {
          service._item = Object.assign(
            {},
            service._item,
            item,
            {
              isFirstItem: itemIndex === 0,
              isLastItem: itemIndex === (items.length - 1),
              index: itemIndex,
              mode: mode,
              preview: preview
            }
          );
        });
    }

    /**
     * @name setNextItem
     * @desc Set the next item to be showed in the preview
     * @return {Object} The current item being showed in the preview
     * @param {Array<Object>} items - List of items currently handled by the preview
     * @memberOf linshare.components.documentPreviewButton.services.documentPreviewService
     */
    function setNextItem(item, items) {
     setItem(
        item.index + 1,
        items
      );
    }

    /**
     * @name setPreviousItem
     * @desc Set the next item to be showed in the preview
     * @return {Object} The current item being showed in the preview
     * @param {Array<Object>} items - List of items currently handled by the preview
     * @return {Object} The current item being showed in the preview
     * @memberOf linshare.components.documentPreviewButton.services.documentPreviewService
     */
    function setPreviousItem(item, items) {
      setItem(
        item.index - 1,
        items
      );
    }
  }
})();
