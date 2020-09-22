/**
 * toastService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('toastService', toastService);

  toastService.$inject = ['_', '$mdToast'];

  /**
   * @namespace toastService
   * @desc Service to manage toast to display
   * @memberOf linshare.components
   */
  function toastService(_, $mdToast) {
    var
      delay = {
        default: 3000,
        long: 6000
      },
      mdToastLocals = {},
      position = 'bottom right',
      stack = [];

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
        toastError: true
      };
      
      return toastShow(mdToastLocals);
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
        toastInfo: true
      };
      
      return toastShow(mdToastLocals);
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
        toastIsolate: true
      };
      
      return toastShow(mdToastLocals);
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
        toastSuccess: true
      };
      
      return toastShow(mdToastLocals);
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
        toastWarning: true
      };
      
      return toastShow(mdToastLocals);
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
     * @returns {Void}
     * @memberOf linshare.components.toastService
     */
    function toastShow(mdToastLocals) {
      _.assign(mdToastLocals, {
        toastClose: toastClose,
        delay: mdToastLocals.toastLabel || mdToastLocals.toastDetails ? delay.long : delay.default
      });

      stack.push(mdToastLocals);

      return (stack.length === 1) && doToastShowFromTheStack();
    }

    /**
     * @name doToastShowFromTheStack
     * @desc Show all Toasts stacked in the stack
     * @returns {Void}
     * @memberOf linshare.components.toastService
     */
    function doToastShowFromTheStack() {
      if (!stack.length) {
        return;
      }

      var mdToastLocals = stack[0];

      return show(mdToastLocals).then(function(mdToastResponsePromise) {
        stack.shift();

        if (!stack.length) {
          return mdToastResponsePromise;
        }

        doToastShowFromTheStack();
      });
    }

    /**
     * @name show
     * @desc Show the toast
     * @param {Object} mdToastLocals - Local variables send to the controller
     * @returns {Promise} promise resolved on toastClose
     * @memberOf linshare.components.toastService
     */
    function show(mdToastLocals) {
      return $mdToast.show({
        locals: mdToastLocals,
        controller: 'toastController',
        controllerAs: 'toastVm',
        bindToController: true,
        position: position,
        hideDelay: 0,
        template: require('./toast.html')
      });
    }
  }
})();
