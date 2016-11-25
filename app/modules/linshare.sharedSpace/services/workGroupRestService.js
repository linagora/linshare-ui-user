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
   *  @namespace workgroupRestService
   *  @descService to interact with Workgroup object by REST
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'work_groups',
      service = {
        create: create,
        get: get,
        getList: getList,
        remove: remove,
        update: update
      };

    return service;

    ////////////

    /**
     *  @name create
     *  @desc Create a Workgroup object
     *  @param {Object} workgroupDto - The Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function create(workgroupDto) {
      $log.debug('workgroupRestService : create', workgroupDto);
      return handler(Restangular.all(restUrl).post(workgroupDto));
    }

    /**
     *  @name get
     *  @desc Get a Workgroup object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function get(workgroupUuid) {
      $log.debug('workgroupRestService : get', workgroupUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the list of Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function getList() {
      $log.debug('workgroupRestService : getList');
      return handler(Restangular.all(restUrl).getList());
    }

    /**
     *  @name remove
     *  @desc Remove a Workgroup object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function remove(workgroupUuid) {
      $log.debug('workgroupRestService : remove', workgroupUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).remove());
    }

    /**
     *  @name update
     *  @desc Update a Workgroup object
     *  @param {Object} workgroupDto - The Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupRestService
     */
    function update(workgroupDto) {
      $log.debug('workgroupRestService : update', workgroupDto);
      return handler(Restangular.one(restUrl, workgroupDto.uuid).customPUT(workgroupDto));
    }
  }
})();
