/**
 * documentUtilsService Factory
 * @namespace documentUtilsService
 * @memberOf LinShare.document
 */
'use strict';

angular.module('linshare.document')
  .factory('documentUtilsService', documentUtilsService);

function documentUtilsService($q) {
  var reloadDocumentsList = false;

  return {
    removeElementFromCollection: removeElementFromCollection,
    selectDocument: toggleItemSelection,
    getItemDetails: getItemDetails,
    resetItemSelection: resetItemSelection,
    getReloadDocumentsList: getReloadDocumentsList,
    setReloadDocumentsList: setReloadDocumentsList
  };

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

  function getItemDetails(itemService, item) {
    var details = {};
    var deferred = $q.defer();
    itemService.get(item.uuid).then(function(data) {
      details = data;
      if (data.hasThumbnail) {
        itemService.thumbnail(item.uuid).then(function(thumbnail) {
          details.thumbnail = thumbnail;
        });
      } else {
        delete details.thumbnail;
      }
      deferred.resolve(details);
    }, function(error) {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  // TODO: To BE REMOVED
  function resetItemSelection(selectedItems) {
    for(var i = selectedItems.length - 1; i >= 0; i--) {
      selectedItems[i].isSelected = false;
      selectedItems.splice(i, 1);
    }
  }
}
