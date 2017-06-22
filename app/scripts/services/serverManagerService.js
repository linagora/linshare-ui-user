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
        toastService.error({key: errorToShow});
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
      const ERRROS_HTTP = {
        400: 'ERROR_400',
        401: 'ERROR_401',
        403: 'ERROR_403',
        404: 'ERROR_404',
        405: 'ERROR_405',
        408: 'ERROR_408',
        500: 'ERROR_500',
        501: 'ERROR_501',
        502: 'ERROR_502',
        503: 'ERROR_503',
        520: 'ERROR_520'
      };
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
          errCode = _.isNil(errorData.data) ? null : errorData.data.errCode;
          deferred.reject(error);

          if (ERRROS_HTTP.hasOwnProperty(error.status)) {
            errorMessageHttpCodes += ERRROS_HTTP[error.status];
            if (error.status === 404 || error.status === 503) {
              errCode = errCode || 'SERVER';
            }
          } else {
            errorMessageHttpCodes += 'ERROR_DEFAULT';
          }
          if (showError) {
            errorMessageDetails += _.isNil(errCode) ? 'NONE' : errCode;
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
