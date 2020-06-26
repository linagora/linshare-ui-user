/**
 * FreeOtpSetupHint Component
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .component('freeOtpSetupHint', {
      templateUrl: 'modules/linshare.secondFactorAuthentication/components/freeOtpSetupHint/freeOtpSetupHint.html',
      controllerAs: 'freeOtpSetupHintVm',
      bindings: {
        config: '<'
      }
    });
})();
