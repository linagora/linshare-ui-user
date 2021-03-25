/**
 * canDeleteSharedSpaces Filter
 * @namespace canDeleteSharedSpaces
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('canDeleteSharedSpaces', canDeleteSharedSpacesFilter);

  canDeleteSharedSpacesFilter.$inject = [
    '$filter',
    '_'
  ];

  /**
   * @namespace canDeleteSharedSpacesFilter
   * @desc Sum deletion permissions of multiple workgroups
   * @returns {boolean} Permission to delete for given workgroups
   * @memberOf LinShare.sharedSpace
   */
  function canDeleteSharedSpacesFilter(
    $filter,
    _
  ) {
    /**
     * @namespace canDeleteSharedSpaces
     * @desc Sum deletion permissions of multiple workgroups
     * @param {Object} workgroups - List of workgroup to check against
     * @param {WorkgroupsPermissions} permissions - The {@link WorkgroupsPermissions} object
     * @returns {boolean} Permission to delete for given workgroups
     * @memberOf LinShare.sharedSpace.canDeleteSharedSpacesFilter
     */
    function canDeleteSharedSpaces(workgroups, permissions) {
      const canDeleteSharedSpaces = !_.some(workgroups, function(workgroup) {
        if (workgroup.nodeType === 'WORK_GROUP') {
          return !permissions[workgroup.uuid].WORKGROUP.DELETE;
        } else {
          return !permissions[workgroup.uuid].DRIVE.DELETE;
        }

      });

      return canDeleteSharedSpaces;
    }

    return canDeleteSharedSpaces;
  }
})();
