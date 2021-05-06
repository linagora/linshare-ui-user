/**
 * itemUtilsService Factory
 * @namespace linshare.utils
 */
(function() {
  'use strict';

  angular
    .module('linshare.utils')
    .factory('itemUtilsService', itemUtilsService);

  itemUtilsService.$inject = [
    '_',
    '$filter',
    '$q',
    '$sce',
    '$log',
    '$translate',
    'authenticationRestService',
    'deviceDetector',
    'dialogService',
    'itemUtilsConstant',
    'lsAppConfig',
    'lsErrorCode',
    'toastService'
  ];

  /**
   * @namespace itemUtilsService
   * @desc Utils service for manipulating file
   * @memberOf linshare.utils
   */

  function itemUtilsService(
    _,
    $filter,
    $q,
    $sce,
    $log,
    $translate,
    authenticationRestService,
    deviceDetector,
    dialogService,
    itemUtilsConstant,
    lsAppConfig,
    lsErrorCode,
    toastService
  )
  {
    var
      invalidNameTranslate = {
        empty: {
          key: 'TOAST_ALERT.ERROR.RENAME_INVALID.EMPTY'
        },
        endingPoint: {
          key: 'TOAST_ALERT.ERROR.RENAME_INVALID.ENDING_POINT'
        },
        rejectedChar: {
          key: 'TOAST_ALERT.ERROR.RENAME_INVALID.REJECTED_CHAR',
          param: lsAppConfig.rejectedChar.join('-, -').replace(new RegExp('-', 'g'), '\'')
        }
      },
      multipleDownloadThreshold = deviceDetector.isMobile() ? 5 : 10,
      regex = new RegExp('[\\' + lsAppConfig.rejectedChar.join('-').replace(new RegExp('-', 'g'), '\\') + ']'),
      service = {
        canShowMultipleDownloadConfirmationDialog: canShowMultipleDownloadConfirmationDialog,
        deleteItem: deleteItem,
        download: download,
        generateFileUrlForPdf: generateFileUrlForPdf,
        isNameValid: isNameValid,
        itemNumber: itemNumber,
        itemUtilsConstant: itemUtilsConstant,
        rename: rename,
        popDialogAndCreate: popDialogAndCreate,
        create: create
      };

    return service;

    ////////////

    /**
     * @name canShowMultipleDownloadConfirmationDialog
     * @desc Determine if the multiple download confirmation dialog shall be shown
     * @param {Array<Object>} items - List of items
     * @return {Promise} validation response
     * @memberOf linshare.utils.itemUtilsService
     */
    function canShowMultipleDownloadConfirmationDialog(items) {
      if (items.length >= multipleDownloadThreshold) {
        return multipleDownloadConfirmationDialog(items);
      }

      return $q.resolve();
    }

    /**
     * @name deleteItem
     * @desc Delete items
     * @param {Object|Array<Object>} items - List of items to delete
     * @param {string} messageKey - Key of the sentence to translate, to show in alert dialog
     * @param {function} callback - Function to execute for deletion
     * @memberOf linshare.utils.itemUtilsService
     */
    function deleteItem(items, messageKey, callback) {
      if (!_.isArray(items)) {
        items = [items];
      }

      $q.all([
        $translate(
          'SWEET_ALERT.ON_ITEM_DELETE.TEXT.' + messageKey,
          {
            nbItems: items.length,
            singular: items.length <= 1 ? 'true' : 'other'
          },
          'messageformat'
        ),
        $translate([
          'SWEET_ALERT.ON_ITEM_DELETE.TITLE',
          'SWEET_ALERT.ON_ITEM_DELETE.CANCEL_BUTTON',
          'SWEET_ALERT.ON_ITEM_DELETE.CONFIRM_BUTTON'
        ])
      ])
        .then(function(promises) {
          var sentences = {
            text: promises[0],
            title: promises[1]['SWEET_ALERT.ON_ITEM_DELETE.TITLE'],
            buttons: {
              cancel: promises[1]['SWEET_ALERT.ON_ITEM_DELETE.CANCEL_BUTTON'],
              confirm: promises[1]['SWEET_ALERT.ON_ITEM_DELETE.CONFIRM_BUTTON']
            }
          };

          return dialogService.dialogConfirmation(sentences, dialogService.dialogType.warning);
        })
        .then(confirmation => {
          if (confirmation) {
            callback(items);
          }
        });
    }

    /**
     * @name download
     * @desc Create a link to launch a download based on the given URL
     * @param {string} url - URL of the ressource to be downloaded
     * @param {string} fileName - Name of the ressource to be downloaded
     * @memberOf linshare.utils.itemUtilsService
     */
    function download(url, fileName) {
      authenticationRestService.checkAuthentication(false, false).then(function() {
        var downloadLink = document.createElement('a');

        downloadLink.setAttribute('href', url);
        downloadLink.setAttribute('download', fileName);

        if (document.createEvent) {
          var event = document.createEvent('MouseEvents');

          event.initEvent('click', true, true);
          downloadLink.dispatchEvent(event);
        } else {
          downloadLink.click();
        }

        downloadLink.remove();
      });
    }

    /**
     * @name generateFileUrlForPdf
     * @desc Generate a file URL for a given buffer
     * @param {ArrayBuffer} buffer - The file array buffer
     * @returns {string} Generate url for the PDF file
     * @memberOf linshare.utils.itemUtilsService
     */
    function generateFileUrlForPdf(buffer) {
      var file = new Blob(
        [buffer],
        { type: 'application/pdf' }
      );
      var url = URL.createObjectURL(file);


      return $sce.trustAsResourceUrl(url);
    }

    /**
     * @name isNameValid
     * @desc Determine if a given object has a valid name for a file system,
     *       not containing any restricted characters
     * @param {string} name - The name of the object to valid
     * @returns {boolean} if the name is valid or not
     * @memberOf linshare.utils.itemUtilsService
     */
    function isNameValid(name) {
      if (!name) {
        toastService.error({key: invalidNameTranslate.empty.key});

        return false;
      }
      if (name.charAt(name.length - 1) === '.') {
        toastService.error({key: invalidNameTranslate.endingPoint.key});

        return false;
      }
      if (regex.test(name)) {
        toastService.error({
          key: invalidNameTranslate.rejectedChar.key,
          params: {
            rejectedChar: invalidNameTranslate.rejectedChar.param
          }
        });

        return false;
      }

      return true;
    }

    /**
     * @name itemNumber
     * @desc Get all "{{defaultName}} (x)" where x is the number of the biggest value +1
     * @param {Array<Object>} items - List of items to evaluate
     * @param {string} defaultName - Default name of the item
     * @returns {integer} number of the new item name
     * @memberOf linshare.utils.itemUtilsService
     */
    function itemNumber(items, defaultName) {
      if (items.length === 0 || !_.some(items, {
        name: defaultName
      })) {
        return 0;
      } else {
        var count = 0;

        _.forEach(items, function(item) {
          if (item.name.indexOf(defaultName) > -1) {
            var number = parseInt(item.name.replace(/\D/g, ''));

            count = number > count ? number : count;
          }
        });

        return count + 1;
      }
    }

    /**
     * @name multipleDownloadConfirmationDialog
     * @desc Prompt dialog to warn about multiple download
     * @param {Array<Object>} items - List of items
     * @return {Promise} user response
     * @memberOf linshare.utils.itemUtilsService
     */
    function multipleDownloadConfirmationDialog(items) {
      return $q.all([
        $translate(
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
          {
            nbFiles: items.length,
            totalSize: $filter('readableSize')(
              _.sumBy(
                items,
                'size'
              ),
              true
            )
          }
        ),
        $translate([
          'ACTION.NEW_FOLDER',
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CANCEL_BUTTON',
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'
        ])
      ])
        .then(function(promises) {
          var sentences = {
            text: promises[0],
            title: promises[1]['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'],
            buttons: {
              cancel: promises[1]['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CANCEL_BUTTON'],
              confirm: promises[1]['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON']
            }
          };

          return dialogService.dialogConfirmation(sentences, dialogService.dialogType.error);
        });
    }

    /**
     * @name rename
     * @desc Set UI to rename an item and save it if valid
     * @param {Object} item - Item manipulated
     * @param {string} selector - Query selector of the item to rename
     * @memberOf linshare.utils.itemUtilsService
     */
    function rename(item, handler) {
      const initialName = item.name.trim();

      return dialogService.dialogInput({
        title: 'ACTION.RENAME',
        initialValue: initialName
      })
        .catch(error => error && $log.error('Error when open dialog input', error))
        .then(result => result.trim())
        .then(check);

      function check(newName) {
        if (newName !== initialName || !item.uuid) {
          return save(newName, item);
        }

        return reset(item);
      }

      function reset(item) {
        return $q.reject({
          config: item,
          data: {
            errCode: lsErrorCode.CANCELLED_BY_USER,
            data: item
          }
        });
      }

      function save(name, item) {
        if (!isNameValid(name)) {
          return reset(item);
        }

        return handler({ ...item, name })
          .then(data => {

            return Object.assign(item, data);
          })
          .catch(error => {
            item.name = initialName;

            throw error;
          });
      }
    }

    /**
     * @name popDialogAndCreate
     * @desc pop out a dialog to enter input and create item if input is valid
     * @param {Object} item - Item manipulated
     * @param {string} selector - Query selector of the item to rename
     * @memberOf linshare.utils.itemUtilsService
     */
    function popDialogAndCreate(item, dialogName) {
      const initialName = item.name.trim();

      return dialogService.dialogInput({
        title: dialogName,
        initialValue: initialName
      })
        .then(result => create(result.trim(), item));
    }

    /**
     * @name create
     * @desc create item if name is valid
     * @param {string} name - Item name
     * @param {Object} item - Item manipulated
     * @memberOf linshare.utils.itemUtilsService
     */
    function create(name, item) {
      if (isNameValid(name)) {
        item.name = name;

        return item.save()
          .then(data => Object.assign(item, data));
      } else {
        return $q.reject();
      }
    }
  }
})();
