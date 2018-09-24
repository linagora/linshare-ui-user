/**
 * workgroupRolesService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupRolesService', workgroupRolesService);

  workgroupRolesService.$inject = [
    '$log',
    '$q',
    '_',
    'authenticationRestService',
    'workgroupMembersRestService'
  ];

  /**
   *  @namespace workgroupRolesService
   *  @desc Service to interact with Workgroup Member object by REST
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupRolesService(
    $log,
    $q,
    _,
    authenticationRestService,
    workgroupMembersRestService
  ) {
    const
    service = {
      getWorkgroupsRoles: getWorkgroupsRoles,
      formatRoles: formatRoles
    };

    return service;

    ////////////

    /**
     * The User Workgroups Roles object.
     * @typedef {Object} UserWorkgroupsRoles
     * @type {String} key - Workgroup uuid
     * @type {Roles} value - {@link Roles} object
     */

    /**
     * @name getWorkgroupsRoles
     * @desc Get role per workgroup for the current logged user
     * @param {Array<object>} workgroups - List of current workgroups shown
     * @return {Array<WorkgroupMember>}
     * @memberOf LinShare.sharedSpace.workgroupRolesService
     */
    function getWorkgroupsRoles(workgroups) {
      $log.debug('workgroupRolesService :  getWorkgroupsRoles', workgroups);
        return authenticationRestService.getCurrentUser()
        .then(function (loggedUser) {
          return $q
            .all(
              _.map(workgroups, function(workgroup) {
                return workgroupMembersRestService.get(workgroup.uuid, loggedUser.uuid);
              })
            );
        });
    }

    /**
     *  @name formatRoles
     *  @desc Format role received to the form of {@link UserWorkgroupRole} object
     *  @param {Object} workgroupsRoles - {@link WorkgroupMember} object
     * @return {UserWorkgroupsRoles}
     *  @memberOf LinShare.sharedSpace.workgroupPermissionsService
     */
    //TODO use service worker!
    function formatRoles(workgroupsRoles) {
      $log.debug('workgroupRolesService :  formatRoles', workgroupsRoles);

      return _.reduce(workgroupsRoles, function(accumulator, workgroupRole) {
        accumulator[workgroupRole.node.uuid] = workgroupRole.role;

        return accumulator;
      }, {});
    }
  }
})();
