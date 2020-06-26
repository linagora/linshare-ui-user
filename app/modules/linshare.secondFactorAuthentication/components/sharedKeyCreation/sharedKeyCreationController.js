/**
 * sharedKeyCreationController Controller
 * @namespace LinShare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .controller('sharedKeyCreationController', sharedKeyCreationController);

  sharedKeyCreationController.$inject = [
    '$timeout',
    'lsAppConfig',
    'secondFactorAuthenticationRestService',
    'FREEOTP_CONFIGURATION'
  ];

  /**
   * @namespace sharedKeyCreationController
   * @desc Application secondFactorAuthentication second factor authentication controller
   * @memberOf LinShare.secondFactorAuthentication
   */

  /* jshint maxparams: false, maxstatements: false */
  function sharedKeyCreationController(
    $timeout,
    lsAppConfig,
    secondFactorAuthenticationRestService,
    FREEOTP_CONFIGURATION
  ) {
    /* jshint validthis:true */
    var secondFactorAuthenticationVm = this;

    secondFactorAuthenticationVm.keyCreationStatus = 'none';
    secondFactorAuthenticationVm.generateSharedKey = generateSharedKey;
    secondFactorAuthenticationVm.dateFormat = lsAppConfig.locale.mediumDate

    function generateSharedKey() {
      secondFactorAuthenticationVm.keyCreationStatus = 'processing';

      secondFactorAuthenticationRestService.create()
        .then(function(secondFA) {
            secondFactorAuthenticationVm.keyCreationStatus = 'done';
            secondFactorAuthenticationVm.keyCreationDate = secondFA.creationDate;
            secondFactorAuthenticationVm.freeOTPConfig = angular.extend({
              account: secondFactorAuthenticationVm.userMail,
              secret: secondFA.sharedKey
            }, FREEOTP_CONFIGURATION)
            secondFactorAuthenticationVm.freeOTPUri = makeFreeOTPUri(secondFactorAuthenticationVm.freeOTPConfig);
            $timeout();
          });
      }

    function makeFreeOTPUri(config) {
      return 'otpauth://' + config.type + '/' +
              encodeURIComponent(config.issuer) + ':' +
              encodeURIComponent(config.account) +
              '?secret=' + config.secret +
              '&algorithm=' + config.algorithm +
              '&digits=' + config.digits +
              '&period=' + config.period;
    }
  }
})();
