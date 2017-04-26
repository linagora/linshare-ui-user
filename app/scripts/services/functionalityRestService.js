/**
 * functionalityRestService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('functionalityRestService', functionalityRestService);

  functionalityRestService.$inject = ['$log', '$q', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace functionalityRestService
   * @desc Service to interact with Functionality object by REST
   * @memberOf linshareUiUserApp
   */
  function functionalityRestService($log, $q, Restangular, ServerManagerService) {
    var
      allFunctionalities = {},
      deferred = $q.defer(),
      handler = ServerManagerService.responseHandler,
      restUrl = 'functionalities',
      service = {
        get: get,
        getAll: getAll,
        getFunctionalities: getFunctionalities,
        getFunctionalityParams: getFunctionalityParams
      };

    return service;

    ////////////

    /**
     * @name get
     * @desc Return the Object containing all functionality and associated param(s)
     * @param {String} funcId - The id of the Funcionality object
     * @returns {Promise} server response
     * @memberOf linshareUiUserApp.functionalityRestService
     */
    function get(funcId) {
      $log.debug('LinshareFunctionalityRestService : get', funcId);
      return handler(Restangular.all(restUrl).one(funcId).get());
    }

    /**
     * @name getAll
     * @desc Return the Object containing all functionality and associated param(s)
     * @returns {Promise} Object functionality:param
     * @memberOf linshareUiUserApp.functionalityRestService
     */
    function getAll() {
      $log.debug('LinshareFunctionalityRestService : getAll');
      return deferred.promise;
    }

    /**
     * @name getFunctionalities
     * @desc Contruct an Object containing the functionality and associated param(s)
     * @returns {Promise} Object functionalities
     * @memberOf linshareUiUserApp.functionalityRestService
     */
    function getFunctionalities() {
      $log.debug('LinshareFunctionalityRestService : getFunctionalities');
      handler(Restangular.all(restUrl).getList()).then(function(allfunc) {
        angular.forEach(allfunc, function(elm) {
          var func = {};
          func[elm.identifier] = elm;
          angular.extend(allFunctionalities, func);
        });
        deferred.resolve(allFunctionalities);
      }, function(err) {
        $log.error('error getting all functionalities', err);
      });
      return deferred.promise;
    }

    /**
     * @name getFunctionalityParams
     * @desc Return the param(s) corresponding to the functionality key given
     * @param {String} key - The key name functionality
     * @returns {Promise} List of param
     * @memberOf linshareUiUserApp.functionalityRestService
     */
    function getFunctionalityParams(key) {
      $log.debug('LinshareFunctionalityRestService : getFunctionalityParams', key);
      return getAll().then(function(all) {
        return all[key];
      });
    }
  }
})();
