/**
 * ServerManager Service
 * @namespace LinShare
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('ServerManagerService', ServerManagerService);

  ServerManagerService.$inject = ['$log', '$q', '$translate', '$translatePartialLoader', 'growlService'];

  /**
   *  @namespace ServerManagerService
   *  @desc Manage server interraction
   *  @memberOf LinShare
   */
  function ServerManagerService($log, $q, $translate, $translatePartialLoader, growlService) {
    $translatePartialLoader.addPart('serverResponse');
    var service = {
      responseHandler: responseHandler
    };

    return service;

    ////////////

    /**
     *  @name notify
     *  @desc Send message to the console and by growl
     *  @param {String} message - The main message
     *  @param {String} details - The details message
     *  @memberOf LinShare.ServerMangerService
     */
    function notify(message, details) {
      var errorToShow = (_.isUndefined(details) || details === '') ? message : message + ': ' + details;
      growlService.notifyTopCenter(errorToShow, 'danger');
      $log.error(errorToShow);
    }

    /**
     *  @name responseHandler
     *  @desc Manage server response
     *  @param {Function} action - A function calling the server side
     *  @returns {Promise} The promise in resolve/reject of the function called
     *  @memberOf LinShare.ServerMangerService
     */
    function responseHandler(action, messagePrefix) {
      messagePrefix = _.isUndefined(messagePrefix) ? 'SERVER_RESPONSE.DEFAULT.' : messagePrefix;
      var
        errorData,
        deferred = $q.defer(),
        errorMessage = messagePrefix,
        errorMessageDetails = messagePrefix + 'DETAILS.';

      action
        .then(function(data) {
          deferred.resolve(data);
        })
        .catch(function(error) {
          errorData = error;
          deferred.reject(error);
          switch (error.status) {
            case 400:
              errorMessage += 'ERROR_400';
              break;
            case 401:
              errorMessage += 'ERROR_401';
              break;
            case 403:
              errorMessage += 'ERROR_403';
              break;
            case 404:
              errorMessage += 'ERROR_404';
              break;
            case 405:
              errorMessage += 'ERROR_405';
              break;
            case 408:
              errorMessage += 'ERROR_408';
              break;
            case 500:
              errorMessage += 'ERROR_500';
              break;
            case 501:
              errorMessage += 'ERROR_501';
              break;
            case 502:
              errorMessage += 'ERROR_502';
              break;
            case 503:
              errorMessage += 'ERROR_503';
              break;
            case 520:
              errorMessage += 'ERROR_520';
              break;
            default:
              errorMessage += 'ERROR_DEFAULT';
              break;
          }
          errorMessageDetails += _.isUndefined(errorData.data.errCode) ? 'NONE' : errorData.data.errCode;
          $translate([errorMessage, errorMessageDetails]).then(function(translations) {
            if (!(translations[errorMessage] === errorMessage ||
                translations[errorMessageDetails] === errorMessageDetails)) {
              notify(translations[errorMessage], translations[errorMessageDetails]);
            } else {
              if (_.isUndefined(errorData.data.errCode)) {
                notify(errorData.statusText);
              } else {
                notify(errorData.statusText, errorData.data.errCode + ': ' + errorData.data.message);
              }
            }
          });
        });
      return deferred.promise;
    }
  }
})();
