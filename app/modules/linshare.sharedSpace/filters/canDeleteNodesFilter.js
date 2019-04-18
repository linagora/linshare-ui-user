/**
 * canDeleteNodes Filter
 * @namespace canDeleteNodes
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('canDeleteNodes', canDeleteNodesFilter);

  canDeleteNodesFilter.$inject = [
    '$filter',
    '_'
  ];

  /**
   * @namespace canDeleteNodesFilter
   * @desc Sum deletion permissions of multiple Nodes
   * @returns {boolean} Permission to delete given Nodes
   * @memberOf LinShare.sharedSpace
   */
  function canDeleteNodesFilter(
    $filter,
    _
  ) {
    /**
     * @namespace canDeleteNodes
     * @desc Sum deletion permissions of multiple Nodes
     * @param {Object} workgroups - List of workgroup to check against
     * @param {WorkgroupPermissions} permission - The {@link WorkgroupsPermissions} object of the workgroup nodes,
     * @returns {boolean} Permission to delete given nodes
     * @memberOf LinShare.sharedSpace.canDeleteNodesFilter
     */
    function canDeleteNodes(Nodes, permission) {
      const type = {
        'DOCUMENT': 'FILE',
        'DOCUMENT_REVISION': 'FILE',
        'FOLDER': 'FOLDER'
      };

      const canDeleteNodes = !_.some(Nodes, function(node) {
        return !permission[type[node.type]].DELETE;
      });

      return canDeleteNodes;
    }

    return canDeleteNodes;
  }
})();
