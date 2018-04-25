/**
 * safeDetailsRestService factory
 * @namespace LinShare.safeDetails
 */
(function () {
  'use strict';

  angular
    .module('linshare.safeDetails')
    .factory(
      'safeDetailsRestService',
      safeDetailsRestService
    );

  safeDetailsRestService.$inject = [
    '$log',
    'Restangular',
    'ServerManagerService'
  ];

  /**
   * @namespace safeDetailsRestService
   * @desc Service to interact with safeDetails object by REST
   * @memberOf LinShare.safeDetails
   */
  function safeDetailsRestService(
    $log,
    Restangular,
    ServerManagerService
  ) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'safe_details',
      service = {
        getList: getList
      };

    return service;

    ////////////

    /**
     * @name getList
     * @desc Get list of the safeDetails object
     * @returns {Promise} Server response
     * @memberOf LinShare.safeDetails.safeDetailsRestService
     */
    function getList() {
      $log.debug('safeDetailsRestService : getList');

      return handler(
        Restangular
          .all(restUrl)
          .getList()
      );
    }
  }
})();
