/**
 * ServerManagerService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('serverResponse');
    }])
    .factory('ServerManagerService', ServerManagerService);

  ServerManagerService.$inject = [
    '_',
    '$log',
    '$q',
    '$translate',
    'Restangular',
    'toastService'
  ];

  /**
   * @namespace ServerManagerService
   * @desc Manage server interaction
   * @memberOf linshareUiUserApp
   */
  function ServerManagerService(
    _,
    $log,
    $q,
    $translate,
    Restangular,
    toastService
  ) {
    var service = {
      getHeaders: getHeaders,
      multiResponsesHanlder: multiResponsesHanlder,
      responseHandler: responseHandler
    };

    return service;

    ////////////

    /**
     * @name errorHandler
     * @desc Manage message response on a error
     * @param {Object} error - Server response error
     * @param {String} messagePrefix - The key of errors's type to show
     * @returns {Promise} The computed error response
     * @memberOf linshareUiUserApp.ServerManagerService
     */
    function errorHandler(error, messagePrefix) {
      var
        errCode,
        errorMessageHttpCodes = 'SERVER_RESPONSE.HTTP_CODES.',
        errorMessageDetails = 'SERVER_RESPONSE.DETAILS.' + messagePrefix + '.';
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

      $log.debug('ServerManagerService - responseHandler:' + error);

      errorMessageHttpCodes += ERRROS_HTTP.hasOwnProperty(error.status) ? ERRROS_HTTP[error.status] : 'ERROR_DEFAULT';
      errCode = _.isNil(error.data) ? null : error.data.errCode;
      if (error.status === 404 || error.status === 503) {
        errCode = errCode || 'SERVER';
      }
      errorMessageDetails += _.isNil(errCode) ? 'NONE' : errCode;

      return $translate.refresh().then(function() {
        return $translate([errorMessageHttpCodes, errorMessageDetails]);
      }).then(function(translations) {
        if (!(translations[errorMessageHttpCodes] === errorMessageHttpCodes ||
              translations[errorMessageDetails] === errorMessageDetails)) {
          return translations[errorMessageHttpCodes] + ': ' + translations[errorMessageDetails];
        } else {
          if (_.isUndefined(errCode)) {
            return error.statusText;
          } else {
            return error.statusText, errCode + ': ' + error.data.message;
          }
        }
      });
    }

    function getHeaders() {
      $log.debug('AuthenticationRestService: getHeaders');
      var rest = Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setFullResponse(true);
      });

      return responseHandler(rest.all('authentication').one('authorized').options()).then(function(response) {
        return response.headers();
      });
    }

    /**
     * @name notify
     * @desc Send message to the console and by toast
     * @param {boolean} isError - determine if an error toast shall be shown
     * @param {Object} message - The message object
     * @param {Object[]} [details] - List of element composing the detailed information
     * @memberOf linshareUiUserApp.ServerManagerService
     */
    function notify(isError, message, details) {
      isError = _.isNil(isError) ? false : isError;
      $log.debug('ServerManagerService - notify - message:' + message);
      $log.debug('ServerManagerService - notify - details:' + details);
      if (isError) {
        toastService.error(message, undefined, details);
      } else {
        toastService.success(message, undefined, details);
      }
    }

    /**
     * @name multiResponsesHandler
     * @desc Manage response of multiple promises at once
     * @param {Object[]} elements - The array of object  with respective promise to handle
     * @param {Object} elements.object - The object reference
     * @param {Promise} elements.response - The promise of the object action
     * @param {Object} translation - Object containing translations information
     * @param {string} translation.key - Translation key value
     * @param {string} [translation.messagePrefix] - The key of errors's type to show
     * @param {Object} [translation.params] - Parameters of the translated sentence
     * @param {boolean} [translation.pluralization] - Determine if the pluralization interpolation shall be used
     * @param {boolean} isSilent - Determine if the error shall be hidden or shown to the user as a toast
     * @returns {Promise} The array of rejected promise or array of all promises resolved
     * @memberOf linshareUiUserApp.ServerManagerService
     */
    function multiResponsesHanlder(elements, translation, isSilent) {
      var
        successResponses = [],
        errorResponses = [],
        objectsReferences = _.map(elements, 'object'),
        responses = [];

      isSilent = _.isNil(isSilent) ? false : isSilent;
      translation.messagePrefix = _.isUndefined(translation.messagePrefix) ? 'DEFAULT' : translation.messagePrefix;

      elements = elements || [];
      if (elements.length === 0 ) {
        return $q.resolve(elements);
      }

      return $q.allSettled(_.map(elements, 'response')).then(function(promises) {
        _.forEach(promises, function(promise) {
          if (promise.state === 'rejected') {
            errorResponses.push(promise);
          } else {
            successResponses.push(promise);
          }
        });

        responses = _.map(errorResponses, function(responseItems) {
          var objectInError = _.find(objectsReferences, {'uuid': responseItems.reason.config.data.uuid});

          return errorHandler(responseItems.reason, translation.messagePrefix).then(function(message) {
            var currentResponse = {
              title: objectInError.name,
              message: {
                key: message
              }
            };

            return currentResponse;
          });
        });

        if (errorResponses.length > 0) {
          return $q.allSettled(responses).then(function(responsesPromises) {
            var errorTranslation= _.assign(translation , {
              key: 'TOAST_ALERT.ERROR.' + translation.key + '.DEFAULT',
              params: {
                nbItems: errorResponses.length,
                singular: errorResponses.length === 1
              }});

            if (!isSilent) {
              notify(true, errorTranslation, _.map(responsesPromises, 'value'));
            }

            return $q.reject(errorResponses);
          });
        } else {
          return $q.resolve(successResponses);
        }
      });
    }

    /**
     * @name responseHandler
     * @desc Manage server response
     * @param {Function} action - A function calling the server side
     * @param {String} messagePrefix - The key of errors's type to show
     * @param {boolean} isSilent - Determine if the error shall be hidden or shown to the user as a toast
     * @returns {Promise} The promise in resolve/reject of the function called
     * @memberOf linshareUiUserApp.ServerManagerService
     */
    function responseHandler(action, messagePrefix, isSilent) {
      isSilent = _.isNil(isSilent) ? false : isSilent;
      messagePrefix = _.isUndefined(messagePrefix) ? 'DEFAULT' : messagePrefix;

      return action.then(function(data) {
        return $q.resolve(data);
      }).catch(function(error) {
        return errorHandler(error, messagePrefix).then(function(message) {
          if (!isSilent) {
            notify(true, {key:message});
          }
          
          return $q.reject(error);
        });
      });
    }
  }
})();
