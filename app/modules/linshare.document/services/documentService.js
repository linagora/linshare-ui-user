/**
 * documentUtilsService Factory
 * @namespace documentUtilsService
 * @memberOf LinShare.document
 */
'use strict';

angular.module('linshare.document')
  .factory('documentUtilsService', documentUtilsService);

function documentUtilsService(_, $translate, $log, $timeout, $q, swal) {
  var reloadDocumentsList = false;

  var swalTitle, swalText, swalConfirm, swalCancel;
  $timeout(function() {
    $translate(['SWEET_ALERT.ON_FILE_DELETE.TITLE', 'SWEET_ALERT.ON_FILE_DELETE.TEXT',
      'SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'])
      .then(function(translations) {
        swalTitle = translations['SWEET_ALERT.ON_FILE_DELETE.TITLE'];
        swalText = translations['SWEET_ALERT.ON_FILE_DELETE.TEXT'];
        swalConfirm = translations['SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON'];
        swalCancel = translations['SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'];
      });
  }, 0);

  return {
    removeElementFromCollection: removeElementFromCollection,
    deleteDocuments: deleteDocuments,
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

  function deleteDocuments(items, callback) {

    if (!angular.isArray(items)) {
      items = [items];
    }
    swal({
        title: swalTitle,
        text: swalText,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: swalConfirm,
        cancelButtonText: swalCancel,
        closeOnConfirm: true,
        closeOnCancel: true
      },
      function(isConfirm) {
        if (isConfirm) {
          callback(items);
        }
      }
    );
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
