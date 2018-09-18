/**
 * canDeleteWorkgroups Filter
 * @namespace canDeleteWorkgroups
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('canDeleteWorkgroups', canDeleteWorkgroupsFilter);

  canDeleteWorkgroupsFilter.$inject = [
    '$filter',
    '_'
  ];

  /**
   * @namespace canDeleteWorkgroupsFilter
   * @desc Sum deletion permissions of multiple workgroups
   * @returns {boolean} Permission to delete for given workgroups
   * @memberOf LinShare.sharedSpace
   */
  function canDeleteWorkgroupsFilter(
    $filter,
    _
  ) {
    /**
     * @namespace canDeleteWorkgroups
     * @desc Sum deletion permissions of multiple workgroups
     * @param {Object} workgroups - List of workgroup to check against
     * @param {WorkgroupsPermissions} permissions - The {@link WorkgroupsPermissions} object
     * @returns {boolean} Permission to delete for given workgroups
     * @memberOf LinShare.sharedSpace.canDeleteWorkgroupsFilter
     */
    function canDeleteWorkgroups(workgroups, permissions) {
      const canDeleteWorkgroups = !_.some(workgroups, function(workgroup) {
        return !permissions[workgroup.uuid].WORKGROUP.DELETE;
      });

      return canDeleteWorkgroups;
    }

    return canDeleteWorkgroups;
  }
})();
