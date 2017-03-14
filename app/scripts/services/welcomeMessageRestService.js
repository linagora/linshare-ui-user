/**
 * welcomeMessageRestService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('welcomeMessageRestService', welcomeMessageRestService);

  welcomeMessageRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace welcomeMessageRestService
   * @desc Service to interact with Home Page by REST
   * @memberOf linshareUiUserApp
   */
  function welcomeMessageRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'welcome_messages',
      service = {
        getList: getList
      };

    return service;

    ////////////

    /**
     * @name getList
     * @desc Return the Object containing all welcome messages
     * @returns {Promise} server response
     * @memberOf linshareUiUserApp.welcomeMessageRestService
     */
    function getList() {
      $log.debug('LinshareWelcomeMessageRestService : getList');
      return handler(Restangular.all(restUrl).getList());
    }
  }
})();
