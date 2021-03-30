/**
 * workgroupPermissionsService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupPermissionsService', workgroupPermissionsService);

  workgroupPermissionsService.$inject = [
    '$log',
    '$q',
    '_',
    'workgroupRolesRestService'
  ];

  /**
   *  @namespace workgroupPermissionsService
   *  @desc Service to interact with Workgroup Member object by REST
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupPermissionsService(
    $log,
    $q,
    _,
    workgroupRolesRestService
  ) {
    const service = {
      formatPermissions: formatPermissions,
      getWorkgroupsPermissions: getWorkgroupsPermissions
    };

    return service;

    ////////////

    /**
     * The User Workgroup Permissions object.
     * @typedef {Object} UserWorkgroupPermissions
     * @type {String} key - Workgroup uuid
     * @type {Object} value - {@link ResourcePermissions} object
     */

    /**
     * The Resource Permission object.
     * @typedef {Object} ResourcePermission
     * @type {String} key - The resource type either DRIVE|WORKGROUP|FOLDER|FILE|MEMBER
     * @type {Object} value - {@link ActionPermission} object
     */

    /**
     * The Action Permission object.
     * @typedef {Object} ActionPermission
     * @type {String} key - The name of the action either CREATE|UPDATE|DELETE|READ|DOWNLOAD
     * @type {Boolean} value - Availability of the action
     */

    /**
     * The Permission object.
     * @typedef {Object} Permission
     * @property {String} action - The name of the action either CREATE|UPDATE|DELETE|READ|DOWNLOAD
     * @property {String} resource - The name of the resource concerned
     * @property {String} type - The type name of the Permission
     * @property {String} uuid - The unique identifier of the permission
     */

    /**
     * The Workgroups Permissions object.
     * @typedef {Object} WorkgroupsPermissions
     * @type {String} key - Workgroup uuid
     * @type {Array<Permission>} value - {@link Permission} object
     */

    /**
     * @name getWorkgroupsPermissions
     * @desc Get permissions per workgroup for the current logged user
     * @param {Array<object>} workgroups - List of current workgroups shown
     * @return {WorkgroupsPermissions}
     * @memberOf LinShare.sharedSpace.workgroupPermissionsService
     */
    function getWorkgroupsPermissions(workgroups) {
      $log.debug('workgroupPermissionsService : getWorkgroupsPermissions', workgroups);

      const getPermissionsMemoize = _.memoize(workgroupRolesRestService.getPermissions);
      const workgroupsRole = _.map(workgroups, function(workgroup) {
        return {
          roleUuid: workgroup.role && workgroup.role.uuid,
          nodeUuid: workgroup.uuid
        };
      });
      const workgroupPermissions = _.map(workgroupsRole, function(workgroupRole) {
        return getPermissionsMemoize (workgroupRole.roleUuid);
      });
      const workgroupsRolesAndPermissions = workgroupPermissions;

      workgroupsRolesAndPermissions.push(workgroupsRole);

      return $q
        .all(workgroupsRolesAndPermissions)
        .then(function(workgroupsRolesAndPermissions) {
          const workgroupsUuid = _.map(workgroupsRolesAndPermissions.pop(), function(workgroupRole) {
            return workgroupRole.nodeUuid;
          });

          return _.zipObject(
            workgroupsUuid,
            workgroupsRolesAndPermissions
          );
        });
    }

    /**
     *  @name formatPermissions
     *  @desc Format permissions received to the form of {@link UserWorkgroupPermission} object
     *  @param {Object} workgroupsPermissions - {@link WorkgroupsPermissions} object
     *  @returns {UserWorkgroupPermissions}
     *  @memberOf LinShare.sharedSpace.workgroupPermissionsService
     */
    //TODO use service worker!
    function formatPermissions(workgroupsPermissions) {
      $log.debug('workgroupPermissionsService : formatPermissions', workgroupsPermissions);

      const defaultActions = {
        CREATE: false,
        UPDATE: false,
        DELETE: false,
        READ: false,
        DOWNLOAD: false
      };
      const formattedWorkgroupsPermissions = _.reduce(
        Object.keys(workgroupsPermissions),
        function(accumulator, workgroupUuid) {
          const resourcesActions = _.reduce(
            workgroupsPermissions[workgroupUuid],
            function(accumulator, permission) {
              if (!accumulator[permission.resource]) {
                accumulator[permission.resource] = Object.assign({}, defaultActions);
              }

              accumulator[permission.resource][permission.action] = true;

              return accumulator;
            }, {});

          accumulator[workgroupUuid] = resourcesActions;

          return accumulator;

          //TODO: Minifier is **SHIT**, can't minify awesome syntax!
          // return Object.assign(accumulator, {
          //   [workgroupUuid]: resourcesActions
          // });
        }, {});

      return formattedWorkgroupsPermissions;
    }
  }
})();
