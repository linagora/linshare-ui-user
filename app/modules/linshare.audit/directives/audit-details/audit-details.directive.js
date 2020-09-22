/**
 * auditDetails Directive
 * @namespace LinShare.Audit
 */
(function() {
  'use strict';

  angular
    .module('linshare.audit')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('audit');
    }])
    .directive('auditDetails', auditDetails);

  /**
   * @namespace auditDetails
   * @desc Popover with details of one audit action
   * @example <div audit-details-popover="{{auditActionObject}}"></div>
   * @memberOf LinShare.Audit
   */
  function auditDetails() {
    var directive = {
      restrict: 'A',
      template: require('./audit-details.html')
    };

    
    return directive;
  }
})();
