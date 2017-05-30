/**
 * ServerManagerService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('ServerManagerService', ServerManagerService);

  ServerManagerService.$inject = ['_', '$log', '$q', '$translate', '$translatePartialLoader', 'toastService'];

  /**
   * @namespace ServerManagerService
   * @desc Manage server interaction
   * @memberOf linshareUiUserApp
   */
  function ServerManagerService(_, $log, $q, $translate, $translatePartialLoader, toastService) {
    $translatePartialLoader.addPart('serverResponse');
    var service = {
      responseHandler: responseHandler
    };

    return service;

    ////////////

    /**
     * @name notify
     * @desc Send message to the console and by toast
     * @param {String} message - The main message
     * @param {String} details - The details message
     * @memberOf linshareUiUserApp.ServerManagerService
     */
    function notify(message, details) {
      var errorToShow = (_.isUndefined(details) || details === '') ? message : message + ': ' + details;
      if (!toastService.isActive()) {
        toastService.error(errorToShow);
      }
      $log.error(errorToShow);
    }

    /**
     * @name responseHandler
     * @desc Manage server response
     * @param {Function} action - A function calling the server side
     * @param {String} messagePrefix - The key of errors's type to show
     * @param {boolean} showError - Determine if the error shall be shown to the user
     * @returns {Promise} The promise in resolve/reject of the function called
     * @memberOf linshareUiUserApp.ServerManagerService
     */
    function responseHandler(action, messagePrefix, showError) {
      showError = _.isUndefined(showError) ? true : showError;
      messagePrefix = _.isUndefined(messagePrefix) ? 'DEFAULT' : messagePrefix;
      var
        errorData,
        deferred = $q.defer(),
        errCode,
        errorMessageHttpCodes = 'SERVER_RESPONSE.HTTP_CODES.',
        errorMessageDetails = 'SERVER_RESPONSE.DETAILS.' + messagePrefix + '.';

      action
        .then(function(data) {
          deferred.resolve(data);
        })
        .catch(function(error) {
          $log.debug('ServerManagerService - responseHandler:' + error);
          errorData = error;
          errCode = errorData.data.errCode;
          deferred.reject(error);
          switch (error.status) {
            case 400:
              errorMessageHttpCodes += 'ERROR_400';
              break;
            case 401:
              errorMessageHttpCodes += 'ERROR_401';
              break;
            case 403:
              errorMessageHttpCodes += 'ERROR_403';
              break;
            case 404:
              errorMessageHttpCodes += 'ERROR_404';
              errCode = errCode || 'SERVER';
              break;
            case 405:
              errorMessageHttpCodes += 'ERROR_405';
              break;
            case 408:
              errorMessageHttpCodes += 'ERROR_408';
              break;
            case 500:
              errorMessageHttpCodes += 'ERROR_500';
              break;
            case 501:
              errorMessageHttpCodes += 'ERROR_501';
              break;
            case 502:
              errorMessageHttpCodes += 'ERROR_502';
              break;
            case 503:
              errorMessageHttpCodes += 'ERROR_503';
              errCode = errCode || 'SERVER';
              break;
            case 520:
              errorMessageHttpCodes += 'ERROR_520';
              break;
            default:
              errorMessageHttpCodes += 'ERROR_DEFAULT';
              break;
          }
          if (showError) {
            errorMessageDetails += _.isUndefined(errCode) ? 'NONE' : errCode;
            $translate.refresh().then(function() {
              $translate([errorMessageHttpCodes, errorMessageDetails]).then(function(translations) {
                if (!(translations[errorMessageHttpCodes] === errorMessageHttpCodes ||
                    translations[errorMessageDetails] === errorMessageDetails)) {
                  notify(translations[errorMessageHttpCodes], translations[errorMessageDetails]);
                } else {
                  if (_.isUndefined(errCode)) {
                    notify(errorData.statusText);
                  } else {
                    notify(errorData.statusText, errCode + ': ' + errorData.data.message);
                  }
                }
              });
            });
          }
        });
      return deferred.promise;
    }
  }
})();
