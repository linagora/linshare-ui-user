/**
 * auditDetails Directive
 * @namespace LinShare.Audit
 */
(function() {
  'use strict';

  angular
    .module('linshare.audit')
    .directive('auditDetails', auditDetails);

  auditDetails.$inject = ['$translatePartialLoader'];

  /**
   * @namespace auditDetails
   * @desc Popover with details of one audit action
   * @example <div audit-details-popover="{{auditActionObject}}"></div>
   * @memberOf LinShare.Audit
   */
  function auditDetails($translatePartialLoader) {
    var directive = {
      restrict: 'A',
      templateUrl: 'modules/linshare.audit/directives/audit-details/audit-details.html',
      link: linkFn
    };
    return directive;

    ///////////

    /**
     *  @name linkFn
     *  @desc DOM manipulation function, related to the directive
     *  @memberOf LinShare.components.auditDetails
     */
    function linkFn() {
      $translatePartialLoader.addPart('audit');
    }
  }
})();
