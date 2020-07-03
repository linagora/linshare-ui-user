(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .constant('FREEOTP_CONFIGURATION', {
      type: 'totp',
      digits: 6,
      issuer: 'LinShare',
      algorithm: 'SHA1',
      period: 30
    })
    .constant('SECOND_FA_REQUIRED_TRANSITION_STATES', {
      from: [
        '', //initial load or reload
        'login',
        'secondFactorAuthentication'
      ]
    });
})();
