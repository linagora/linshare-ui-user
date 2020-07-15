/**
 * FreeOtpSetupHint Component
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .component('freeOtpSetupHint', {
      template: require('./freeOtpSetupHint.html'),
      controllerAs: 'freeOtpSetupHintVm',
      bindings: {
        config: '<'
      }
    });
})();
