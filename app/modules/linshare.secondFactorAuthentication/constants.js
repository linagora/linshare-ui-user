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
    });
})();
