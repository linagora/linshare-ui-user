/**
 * auditRestService factory
 * @namespace LinShare.audit
 */
(function() {
  'use strict';

  angular
    .module('linshare.audit')
    .factory('auditRestService', auditRestService);

  auditRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace auditRestService
   * @desc Service to interact with Audit object by REST
   * @memberOf LinShare.audit
   */
  function auditRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'audit',
      service = {
        getList: getList
      };

    return service;

    ////////////

    /**
     * @name getList
     * @desc Get list of the audit object
     * @param {jQuery.Event} $event - Event bound to the change
     * @returns {Promise} server response
     * @memberOf LinShare.audit.auditRestService
     */
    function getList(params) {
      $log.debug('auditRestService : getList');
      return handler(Restangular.all(restUrl).getList(params));
    }
  }
})();
