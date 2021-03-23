/**
 * workgroupRolesRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupRolesRestService', workgroupRolesRestService);

  workgroupRolesRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace workgroupRolesRestService
   *  @desc Service to interact with Workgroup Role object by REST
   *  @roleOf LinShare.sharedSpace
   */
  function workgroupRolesRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'shared_space_roles',
      service = {
        get: get,
        getList: getList,
        getPermissions: getPermissions
      };

    return service;

    ////////////

    /**
     * The Role object.
     * @typedef {Object} Role
     * @property {String} name - The name of the role either admin|writer|contributor|reader
     * @property {String} uuid - The unique identifier of the role
     */

    /**
     *  @name get
     *  @desc Get a Workgroup Role object
     *  @param {String} roleUuid - The id of the Workgroup Role object
     *  @returns {Promise<Role>} server response
     *  @roleOf LinShare.sharedSpace.workgroupRolesRestService
     */
    function get(roleUuid) {
      $log.debug('workgroupRolesRestService :  get', roleUuid);

      return handler(Restangular.one(restUrl, roleUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the list of Workgroup Role object
     *  @returns {Promise<Array<Role>>} server response
     *  @roleOf LinShare.sharedSpace.workgroupRolesRestService
     */
    function getList(nodeType) {
      $log.debug('workgroupRolesRestService :  getList');

      return handler(Restangular.all(restUrl).getList({ nodeType }));
    }

    /**
     *  @name get
     *  @desc Get a Workgroup Role object
     *  @param {String} roleUuid - The id of the Workgroup Role object
     *  @returns {Promise<Array<Permissions>>} server response
     *  @roleOf LinShare.sharedSpace.workgroupRolesRestService
     */
    function getPermissions(roleUuid) {
      $log.debug('workgroupRolesRestService :  getPermissions', roleUuid);

      return handler(Restangular.one(restUrl, roleUuid).one('permissions').get());
    }
  }
})();
