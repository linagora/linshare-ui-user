/**
 * Audit Module
 * @namespace Audit
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular
    .module(
      'linshare.audit',
      [
        'restangular',
        'pascalprecht.translate',
      ]);

})();

require('./constants');
require('./controllers/AuditController');
require('./directives/audit-details/audit-details.directive');
require('./services/auditDetailsService');
require('./services/auditRestService');