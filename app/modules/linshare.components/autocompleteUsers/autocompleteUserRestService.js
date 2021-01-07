/**
 * autocompleteUserRestService factory
 * @namespace LinShare.component
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('autocompleteUserRestService', autocompleteUserRestService);

  autocompleteUserRestService.$inject = ['$log', '$q', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace autocompleteUserRestService
   *  @desc Service to interact with User object by REST for the autocompletion component
   *  @memberof LinShare.component
   */
  function autocompleteUserRestService($log, $q, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'autocomplete',
      service = {
        search: search
      };

    return service;

    ////////////

    /**
     *  @name search
     *  @desc search a User object
     *  @param {String} pattern - The pattern used for search
     *  @param {String} searchType - Type of the search
     *  @param {String} threadUuid - The uuid of the User object
     *  @returns {Promise} server response
     *  @memberof LinShare.components.autocompleteUserRestService
     */
    function search(pattern, searchType, threadUuid) {
      $log.debug('autocompleteUserRestService : search', pattern, searchType, threadUuid);

      return handler(Restangular.all(restUrl).one(encodeURIComponent(pattern)).get({
        type: searchType,
        threadUuid: threadUuid
      }));
    }
  }
})();
