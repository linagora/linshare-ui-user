/**
 * itemUtilsService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('itemUtilsService', itemUtilsService);

  itemUtilsService.$inject = ['$q', '$timeout', '$translate', 'lsAppConfig', 'toastService'];

  /**
   * @namespace itemUtilsService
   * @desc Utils service for manipulating file
   * @memberOf linshare.components
   */
  function itemUtilsService($q, $timeout, $translate, lsAppConfig, toastService) {
    var
      invalidNameTranslate = {
        empty: {
          key: 'GROWL_ALERT.ERROR.RENAME_INVALID.EMPTY',
          value: ''
        },
        endingPoint: {
          key: 'GROWL_ALERT.ERROR.RENAME_INVALID.ENDING_POINT',
          value: ''
        },
        rejectedChar: {
          key: 'GROWL_ALERT.ERROR.RENAME_INVALID.REJECTED_CHAR',
          param: lsAppConfig.rejectedChar.join('-, -').replace(new RegExp('-', 'g'), '\''),
          value: ''
        }
      },
      regex = new RegExp('[\\' + lsAppConfig.rejectedChar.join('-').replace(new RegExp('-', 'g'), '\\') + ']'),
      service = {
        isNameValid: isNameValid,
        itemNumber: itemNumber,
        rename: rename
      };
    initService();
    return service;

    ////////////

    function initService() {
      $q.all([$translate([invalidNameTranslate.empty.key, invalidNameTranslate.endingPoint.key]),
        $translate(invalidNameTranslate.rejectedChar.key, {
          rejectedChar: invalidNameTranslate.rejectedChar.param
        })
      ]).then(function(promises) {
        invalidNameTranslate.empty.value = promises[0][invalidNameTranslate.empty.key];
        invalidNameTranslate.endingPoint.value = promises[0][invalidNameTranslate.endingPoint.key];
        invalidNameTranslate.rejectedChar.value = promises[1];
      });
    }


    /**
     * @name isNameValid
     * @desc Determine if a given object has a valid name for a file system,
     *       not containing any restricted characters
     * @param {string} name - The name of the object to valid
     * @returns {boolean} if the name is valid or not
     * @memberOf linshare.components.itemUtilsService
     */
    function isNameValid(name) {
      if (name === '') {
        toastService.error(invalidNameTranslate.empty.value);
        return false;
      }
      if (name.charAt(name.length - 1) === '.') {
        toastService.error(invalidNameTranslate.endingPoint.value);
        return false;
      }
      if (regex.test(name)) {
        toastService.error(invalidNameTranslate.rejectedChar.value);
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
     * @memberOf linshare.components.itemUtilsService
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
     * @name rename
     * @desc Set UI to rename an item and save it if valid
     * @param {Object} item - Item manipulated
     * @param {string} selector - Query selector of the item to rename
     * @memberOf linshare.components.itemUtilsService
     */
    function rename(item, selector) {
      var done = false,
        deferred = $q.defer(),
        initialName = item.name.trim(),
        itemElement = angular.element(document.querySelector('body')).find(selector);
      itemElement.attr('contenteditable', 'true')
        .on('focus', function() {
          $timeout(function() {
            itemElement.text(initialName);
            document.execCommand('selectAll', false, null);
          }, 0);
        })
        .on('focusout', function(e) {
          if (!done) {
            var newName = angular.element(e.target).text();
            if (newName !== initialName || !item.uuid) {
              save(newName, item);
            } else {
              reset(item);
            }
          }
        })
        .on('keydown', function(e) {
          //esc
          if (e.which === 27 || e.keyCode === 27) {
            reset(item);
          }
          //enter
          if (e.which === 13) {
            save(angular.element(e.target).text(), item);
          }
        });
      itemElement.focus();
      return deferred.promise;

      /**
       * @name clean
       * @desc Remove listeners set on DOM object
       * @memberOf itemUtilsService.rename
       */
      function clean() {
        itemElement.attr('contenteditable', 'false')
          .off('focus')
          .off('keydown')
          .off('focus');
      }

      /**
       * @name reset
       * @desc Reset the name into the object 'item'
       * @param {Object} item - Item manipulated
       * @memberOf itemUtilsService.rename
       */
      function reset(item) {
        done = true;
        clean();
        itemElement.text(initialName);
        deferred.reject({
          config: item,
          data: {
            errCode: 90909, //TODO: See with @FMA to define a number
            data: item
          }
        });
      }

      /**
       * @name save
       * @desc Save the name into the object 'item'
       * @param {string} name - New name for the item to be saved
       * @param {Object} item - Item manipulated
       * @memberOf itemUtilsService.rename
       */
      function save(name, item) {
        name = name.trim();
        if (isNameValid(name)) {
          done = true;
          clean();
          item.name = name;
          item.save().then(function(data) {
            deferred.resolve(data);
          }).catch(function(error) {
            deferred.reject(error);
            itemElement.text(initialName);
            item.name = initialName;
            itemElement.focus();
          });
        } else {
          itemElement.focus();
        }
      }
    }
  }
})();
