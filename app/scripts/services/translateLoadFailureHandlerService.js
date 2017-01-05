/**
 * translateLoadFailureHandlerService Factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('translateLoadFailureHandlerService', translateLoadFailureHandlerService);

  translateLoadFailureHandlerService.$inject = ['$http', '$log', '$q', 'lsAppConfig'];

  /**
   * @namespace translateLoadFailureHandlerService
   * @desc Service to interact with translation files error
   * @memberOf linshareUiUserApp
   */
  function translateLoadFailureHandlerService($http, $log, $q, lsAppConfig) {

    return handleError;

    ////////////

    /**
     * @name handleError
     * @desc Manage error when translation file is not loaded
     * @param {String} part - URL of translation file
     * @param {String} lang - Lang chosen for getting translation file
     * @returns {Promise} server response
     * @memberOf linshareUiUserApp.translateLoadFailureHandlerService
     */
    function handleError(part, lang) {
      $log.error('The "' + lsAppConfig.localPath + '/' + lang + '/' + part + '.json' + '" part was not loaded.');
      var path = 'i18n/original/' + lang + '/' + part + '.json';
      var promise = $q.when(
        $http.get(path).then(function(data) {
          return data.data;
        })
      );
      return promise;
    }
  }
})();
