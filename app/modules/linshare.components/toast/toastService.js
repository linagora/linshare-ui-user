/**
 * toastService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('toastService', toastService);

  toastService.$inject = ['_', '$mdToast', '$q', 'componentsConfig'];

  /**
   * @namespace toastService
   * @desc Service to manage toast to display
   * @memberOf linshare.components
   */
  function toastService(_, $mdToast, $q, componentsConfig) {
    var
      delay = {
        default: 3000,
        none: 0
      },
      mdToastLocals = {},
      position = 'bottom right',
      stack = [],
      templateUrl = componentsConfig.path + 'toast/toast.html';

    var service = {
      error: error,
      info: info,
      isActive: isActive,
      isolate: isolate,
      success: success,
      warning: warning
    };

    return service;

    ////////////

    /**
     * @name error
     * @desc Show a toast error
     * @param {Object} texte - Text of the toast
     * @param {string} texte.key - Translation key value
     * @param {Object} [texte.params] - Parameters of the translated sentence
     * @param {boolean} [texte.pluralization] - Determine if the pluralization interpolation shall be used
     * @param {string} [label] - Button label to replace close icon
     * @param {Object[]} [details] - List of element composing the detailed information
     * @param {string} [details[].title] - Title of the error
     * @param {string} [details[].message] - Message of the error
     * @returns {Promise} promise resolved on toastClose
     * @memberOf linshare.components.toastService
     */
    function error(texte, label, details) {
      mdToastLocals = {
        toastText: texte,
        toastLabel: label,
        toastDetails: details,
        toastError: true,
        toastClose: toastClose
      };
      return toastShow(mdToastLocals, delay.none);
    }

    /**
     * @name info
     * @desc Show a toast info
     * @param {Object} texte - Text of the toast
     * @param {string} texte.key - Translation key value
     * @param {Object} [texte.params] - Parameters of the translated sentence
     * @param {boolean} [texte.pluralization] - Determine if the pluralization interpolation shall be used
     * @param {string} [label] - Button label to replace close icon
     * @param {Object[]} [details] - List of element composing the detailed information
     * @param {string} [details[].title] - Title of the error
     * @param {string} [details[].message] - Message of the error
     * @returns {Promise} promise resolved on toastClose
     * @memberOf linshare.components.toastService
     */
    function info(texte, label, details) {
      mdToastLocals = {
        toastText: texte,
        toastLabel: label,
        toastDetails: details,
        toastInfo: true,
        toastClose: toastClose
      };
      return toastShow(mdToastLocals, delay.default);
    }

    /**
     * @name isActive
     * @desc Determine if a toast is active or not
     * @returns {boolean} if a toast is active or not
     * @memberOf linshare.components.toastService
     */
    function isActive() {
      return stack.length > 0;
    }

    /**
     * @name isolate
     * @desc Show a toast isolate
     * @param {Object} texte - Text of the toast
     * @param {string} texte.key - Translation key value
     * @param {Object} [texte.params] - Parameters of the translated sentence
     * @param {boolean} [texte.pluralization] - Determine if the pluralization interpolation shall be used
     * @param {string} [label] - Button label to replace close icon
     * @param {Object[]} [details] - List of element composing the detailed information
     * @param {string} [details[].title] - Title of the error
     * @param {string} [details[].message] - Message of the error
     * @returns {Promise} promise resolved on toastClose
     * @memberOf linshare.components.toastService
     */
    function isolate(texte, label, details) {
      mdToastLocals = {
        toastText: texte,
        toastLabel: label,
        toastDetails: details,
        toastIsolate: true,
        toastClose: toastClose
      };
      return toastShow(mdToastLocals, delay.none);
    }

    /**
     * @name success
     * @desc Show a toast success
     * @param {Object} texte - Text of the toast
     * @param {string} texte.key - Translation key value
     * @param {Object} [texte.params] - Parameters of the translated sentence
     * @param {boolean} [texte.pluralization] - Determine if the pluralization interpolation shall be used
     * @param {string} [label] - Button label to replace close icon
     * @param {Object[]} [details] - List of element composing the detailed information
     * @param {string} [details[].title] - Title of the error
     * @param {string} [details[].message] - Message of the error
     * @returns {Promise} promise resolved on toastClose
     * @memberOf linshare.components.toastService
     */
    function success(texte, label, details) {
      mdToastLocals = {
        toastText: texte,
        toastLabel: label,
        toastDetails: details,
        toastSuccess: true,
        toastClose: toastClose
      };
      return toastShow(mdToastLocals, delay.default);
    }

    /**
     * @name warning
     * @desc Show a toast warning
     * @param {Object} texte - Text of the toast
     * @param {string} texte.key - Translation key value
     * @param {Object} [texte.params] - Parameters of the translated sentence
     * @param {boolean} [texte.pluralization] - Determine if the pluralization interpolation shall be used
     * @param {string} [label] - Button label to replace close icon
     * @param {Object[]} [details] - List of element composing the detailed information
     * @param {string} [details[].title] - Title of the error
     * @param {string} [details[].message] - Message of the error
     * @returns {Promise} promise resolved on toastClose
     * @memberOf linshare.components.toastService
     */
    function warning(texte, label, details) {
      mdToastLocals = {
        toastText: texte,
        toastLabel: label,
        toastDetails: details,
        toastWarning: true,
        toastClose: toastClose
      };
      return toastShow(mdToastLocals, delay.default);
    }

    /**
     * @name toastClose
     * @desc Close action of the toast
     * @param {boolean} actionClicked - Check if the action button is clicked
     * @returns {Promise} promise with list of details passed if given
     * @memberOf linshare.components.toastService
     */
    function toastClose(actionClicked) {
      return $mdToast.hide({
        actionClicked: actionClicked
      });
    }

    /**
     * @name toastShow
     * @desc Show the toast
     * @param {Object} mdToastLocals - Local variables send to the controller
     * @param {number} delay - Delay of the toast to be shown
     * @returns {Promise} promise resolved on toastClose
     * @memberOf linshare.components.toastService
     */
    function toastShow(mdToastLocals, delay) {
      if (isActive()) {
        var deferred = $q.defer();
        stack.push({
          mdToastLocals: mdToastLocals,
          delay: delay,
          promise: deferred.promise
        });
        return $q(function(resolve) {
          stack.shift().promise.then(function() {
            show(mdToastLocals, delay).then(function(data) {
              deferred.resolve();
              resolve(data);
            });
          });
        });
      } else {
        var mdToastInstance = show(mdToastLocals, delay);
        stack.push({
          mdToastLocals: mdToastLocals,
          delay: delay,
          promise: mdToastInstance
        });
        return mdToastInstance;
      }

      /**
       * @name show
       * @desc Show the toast
       * @param {Object} mdToastLocals - Local variables send to the controller
       * @param {number} delay - Delay of the toast to be shown
       * @returns {Object} promise resolved on toastClose
       * @memberOf linshare.components.toastService.toastShow
       */
      function show(mdToastLocals, delay) {
        var mdToast = $mdToast.show({
          locals: mdToastLocals,
          controller: 'toastController',
          controllerAs: 'toastVm',
          bindToController: true,
          hideDelay: delay,
          position: position,
          templateUrl: templateUrl
        });

        mdToast.then(function() {
          _.remove(stack, {
            mdToastLocals: mdToastLocals,
            delay: delay
          });
        });

        return mdToast;
      }
    }
  }
})();
