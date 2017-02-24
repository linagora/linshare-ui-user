/**
 * auditDetailsPopup Directive
 * @namespace LinShare.Audit
 */
(function() {
  'use strict';

  angular
    .module('linshare.audit')
    .directive('auditDetailsPopover', auditDetailsPopover);

  /**
   * @namespace auditDetailsPopover
   * @desc Popover with details of one audit action
   * @example <div audit-details-popover="auditActionObject"></div>
   * @memberOf LinShare.Audit
   */
  function auditDetailsPopover() {
    var directive = {
      restrict: 'A',
      templateUrl: 'modules/linshare.audit/directives/audit-details-popover/audit-details-popover.html'
    };
    return directive;
  }
})();
