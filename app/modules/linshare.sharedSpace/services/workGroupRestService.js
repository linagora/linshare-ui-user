/**
 * workgroupRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupRestService', workgroupRestService);

  workgroupRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace workgroupRestService
   * @descService to interact with Workgroup object by REST
   * @memberOf LinShare.sharedSpace
   */
  function workgroupRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'work_groups',
      service = {
        create: create,
        get: get,
        getAudit: getAudit,
        getList: getList,
        getQuota: getQuota,
        remove: remove,
        restangularize: restangularize,
        update: update
      };

    return service;

    ////////////

    /**
     * @name create
     * @desc Create a Workgroup object
     * @param {Object} workgroupDto - The Workgroup object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function create(workgroupDto) {
      $log.debug('workgroupRestService : create', workgroupDto);
      return handler(Restangular.all(restUrl).post(workgroupDto));
    }

    /**
     * @name get
     * @desc Get a Workgroup object
     * @param {String} workgroupUuid - The id of a Workgroup object
     * @param {boolean} needMembers - Get members in this same request
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function get(workgroupUuid, needMembers) {
      $log.debug('workgroupRestService : get', workgroupUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).get({members: needMembers}));
    }

    /**
     * @name getAudit
     * @desc Get audit of a Workgroup object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function getAudit(workgroupUuid, nodeUuid) {
      $log.debug('workgroupRestService : getAudit', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one('audit').get());
    }

    /**
     * @name getQuota
     * @desc Get quota of workgroup
     * @param {string} quotaUuid - The uuid of workgroup's quota
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function getQuota(quotaUuid) {
      $log.debug('workgroupRestService - getQuota', quotaUuid);
      return handler(Restangular.one('quota', quotaUuid).get());
    }

    /**
     * @name getList
     * @desc Get the list of Workgroup object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function getList() {
      $log.debug('workgroupRestService : getList');
      return handler(Restangular.all(restUrl).getList());
    }

    /**
     * @name remove
     * @desc Remove a Workgroup object
     * @param {String} workgroupUuid - The id of a Workgroup object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function remove(workgroupUuid) {
      $log.debug('workgroupRestService : remove', workgroupUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).remove());
    }

    /**
     * @name restangularize
     * @desc Restangularize an item
     * @param {Object} item - Item to be restangularized
     * @returns {Object} Restangualr object
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function restangularize(item) {
      $log.debug('workgroupRestService : restangularize', item);
      return Restangular.restangularizeElement(null, item, restUrl);
    }

    /**
     * @name update
     * @desc Update a Workgroup object
     * @param {Object} workgroupDto - The Workgroup object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function update(workgroupDto) {
      $log.debug('workgroupRestService : update', workgroupDto);
      return handler(Restangular.one(restUrl, workgroupDto.uuid).customPUT(workgroupDto));
    }
  }
})();
