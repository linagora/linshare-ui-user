/**
 * sharedSpaceRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('sharedSpaceRestService', sharedSpaceRestService);

  sharedSpaceRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace sharedSpaceRestService
   * @descService to interact with Workgroup object by REST
   * @memberOf LinShare.sharedSpace
   */
  function sharedSpaceRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'shared_spaces',
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

    /**1
     * @name create
     * @desc Create a Workgroup object
     * @param {Object} workgroupDto - The Workgroup object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function create(workgroupDto) {
      $log.debug('sharedSpaceRestService : create', workgroupDto);

      return handler(Restangular.all(restUrl).post(workgroupDto));
    }

    /**
     * @name get
     * @desc Get a sharedspace object
     * @param {String} uuid - The id of a Workgroup object
     * @param {Object} options
     * - withMembers: includes members
     * - withRole: includes role
     * - populateWorkspace: populate workspace field if exists
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function get(
      uuid,
      {
        withMembers = false,
        withRole = false,
        populateWorkspace = false
      } = {}
    ) {
      $log.debug('sharedSpaceRestService : get', uuid);

      return _fetchSharedSpace(uuid, false)
        .then(sharedSpace => {
          if (!sharedSpace.parentUuid || !populateWorkspace) {
            return sharedSpace;
          }

          return _fetchSharedSpace(sharedSpace.parentUuid, true).then(workspace => {
            sharedSpace.workspace = workspace;

            return sharedSpace;
          }).catch(() => sharedSpace);
        });

      function _fetchSharedSpace(uuid, silent) {
        return handler(Restangular.one(restUrl, uuid).get({
          members: withMembers,
          withRole: withRole
        }), null, silent);
      }
    }

    /**
     * @name getAudit
     * @desc Get audit of a Workgroup object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function getAudit(workgroupUuid, nodeUuid) {
      $log.debug('sharedSpaceRestService : getAudit', workgroupUuid, nodeUuid);

      return handler(Restangular.one('shared_spaces', workgroupUuid).one('audit').get());
    }

    /**
     * @name getQuota
     * @desc Get quota of workgroup
     * @param {string} quotaUuid - The uuid of workgroup's quota
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function getQuota(quotaUuid) {
      $log.debug('sharedSpaceRestService - getQuota', quotaUuid);

      return handler(Restangular.one('quota', quotaUuid).get());
    }

    /**
     * @name getList
     * @desc Get the list of Workgroup object
     * @param {boolean} withRole - Get Role of current user per workgroup
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function getList(withRole, parent) {
      $log.debug('sharedSpaceRestService : getList');

      return handler(Restangular.all(restUrl).getList({ withRole, parent }));
    }

    /**
     * @name remove
     * @desc Remove a Workgroup object
     * @param {String} workgroupUuid - The id of a Workgroup object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function remove(workgroupUuid) {
      $log.debug('sharedSpaceRestService : remove', workgroupUuid);

      return handler(Restangular.one(restUrl, workgroupUuid).remove());
    }

    /**
     * @name restangularize
     * @desc Restangularize an item
     * @param {Object} item - Item to be restangularized
     * @returns {Object} Restangualr object
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function restangularize(item) {
      $log.debug('sharedSpaceRestService : restangularize', item);

      return Restangular.restangularizeElement(null, item, restUrl);
    }

    /**
     * @name update
     * @desc Update a Workgroup object
     * @param {Object} workgroupDto - The Workgroup object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.sharedSpaceRestService
     */
    function update(workgroupDto) {
      $log.debug('sharedSpaceRestService : update', workgroupDto);

      return handler(Restangular.one(restUrl, workgroupDto.uuid).customPUT(workgroupDto));
    }
  }
})();
