/**
 * workgroupMembersRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupMembersRestService', workgroupMembersRestService);

  workgroupMembersRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace workgroupMembersRestService
   *  @desc Service to interact with Workgroup Member object by REST
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupMembersRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'work_groups',
      restParam = 'members',
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
     *  @desc Create a Workgroup Member object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {Object} workgroupMemberDto - The Workgroup Member object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupMembersRestService
     */
    function create(workgroupUuid, workgroupMemberDto) {
      $log.debug('workgroupMembersRestService : create', workgroupUuid, workgroupMemberDto);
      return handler(Restangular.one(restUrl, workgroupUuid).all(restParam).post(workgroupMemberDto));
    }

    /**
     *  @name get
     *  @desc Get a Workgroup Member object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} memberUuid - The id of the Workgroup Member object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupMembersRestService
     */
    function get(workgroupUuid, memberUuid) {
      $log.debug('workgroupMembersRestService :  get', workgroupUuid, memberUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, memberUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the list of Workgroup Member object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupMembersRestService
     */
    function getList(workgroupUuid) {
      $log.debug('workgroupMembersRestService :  getList', workgroupUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).all(restParam).getList());
    }

    /**
     *  @name remove
     *  @desc Remove a Workgroup Member object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} memberUuid - The id of the Workgroup Member object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupMembersRestService
     */
    function remove(workgroupUuid, memberUuid) {
      $log.debug('workgroupMembersRestService :  remove', workgroupUuid, memberUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, memberUuid).remove());
    }

    /**
     *  @name update
     *  @desc Update a Workgroup Member object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {Object} workgroupMemberDto - The Workgroup Member object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupMembersRestService
     */
    function update(workgroupUuid, workgroupMemberDto) {
      $log.debug('workgroupMembersRestService :  update', workgroupUuid, workgroupMemberDto);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, workgroupMemberDto.uuid)
        .customPUT(workgroupMemberDto));
    }
  }
})();
