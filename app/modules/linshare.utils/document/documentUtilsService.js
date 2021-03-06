/**
 * documentUtilsService Factory
 * @namespace linshare.utils
 */
(function() {
  'use strict';

  angular
    .module('linshare.utils')
    .factory('documentUtilsService', documentUtilsService);

  documentUtilsService.$inject = [
    '_',
    '$q',
    'itemUtilsService'
  ];

  /**
   * @namespace documentUtilsService
   * @desc Utils service for manipulating file
   * @memberOf linshare.utils
   */
  function documentUtilsService(_, $q, itemUtilsService) {
    var reloadDocumentsList = false;

    itemUtilsService.getReloadDocumentsList = getReloadDocumentsList;
    itemUtilsService.loadItemThumbnail = loadItemThumbnail;
    itemUtilsService.removeElementFromCollection = removeElementFromCollection;
    itemUtilsService.resetItemSelection = resetItemSelection;
    itemUtilsService.selectDocument = toggleItemSelection;
    itemUtilsService.setReloadDocumentsList = setReloadDocumentsList;

    return itemUtilsService;

    ////////////

    /**
     * @name loadItemThumbnail
     * @desc Check if thumbnail exists and load it
     * @param {object} item - Item which will contains the thumbnail
     * @param {promise} getThumbnail - Promise which supplies the thumbnail
     * @memberOf linshare.utils.documentUtilsService
     */
    function loadItemThumbnail(item, getThumbnail, { force = false } = {}) {
      if (
        !force && (
          (item.type && item.type === 'FOLDER') ||
          !item.hasThumbnail
        )
      ) {
        return $q.when(item);
      }

      delete item.thumbnail;

      return getThumbnail().then(function(thumbnail) {
        if (_.isUndefined(thumbnail)) {
          item.thumbnailUnloadable = true;
          item.hasThumbnail = false;
        } else {
          item.hasThumbnail = true;
          item.thumbnail = thumbnail;
        }

        return item;
      });
    }

    /***********************************************************************************************************/
    /****************** TODO : refactor all functions below and push them in Abysse Deeply ************/
    /***********************************************************************************************************/

    /**
     * @namespace getReloadDocumentsList
     * @desc Return variable reloadDocumentsList
     * @returns {boolean} reloadDocumentsList's value
     * @memberOf LinShare.document.documentUtilsService
     */
    function getReloadDocumentsList() {
      return reloadDocumentsList;
    }

    /**
     * @namespace setReloadDocumentsList
     * @desc Set new value to the variable reloadDocumentsList
     * @param {boolean} value - value to apply to the variable reloadDocumentsList
     * @memberOf LinShare.document.documentUtilsService
     */
    function setReloadDocumentsList(value) {
      reloadDocumentsList = value;
    }

    function removeElementFromCollection(collection, element) {
      var index = collection.indexOf(element);

      if (index > -1) {
        collection.splice(index, 1);
      }

      return collection;
    }

    function toggleItemSelection(selectedItems, item) {
      item.isSelected = !item.isSelected;
      if (item.isSelected) {
        selectedItems.push(item);
      } else {
        removeElementFromCollection(selectedItems, item);
      }
    }

    // TODO: To BE REMOVED
    function resetItemSelection(selectedItems) {
      for(var i = selectedItems.length - 1; i >= 0; i--) {
        selectedItems[i].isSelected = false;
        selectedItems.splice(i, 1);
      }
    }
  }
})();
