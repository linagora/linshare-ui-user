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
    'secondFactorAuthenticationRestService',
    'secondFactorAuthenticationTransitionService',
    'FREEOTP_CONFIGURATION'
  ];

  /**
   * @namespace sharedKeyCreationController
   * @desc Application secondFactorAuthentication second factor authentication controller
   * @memberOf LinShare.secondFactorAuthentication
   */

  function sharedKeyCreationController(
    $timeout,
    secondFactorAuthenticationRestService,
    secondFactorAuthenticationTransitionService,
    FREEOTP_CONFIGURATION
  ) {
    /* jshint validthis:true */
    var secondFactorControllerVm = this;

    secondFactorControllerVm.keyCreationStatus = 'none';
    secondFactorControllerVm.generateSharedKey = generateSharedKey;

    function generateSharedKey() {
      secondFactorControllerVm.keyCreationStatus = 'processing';

      secondFactorAuthenticationRestService.create()
        .then(function(secondFA) {
          secondFactorControllerVm.keyCreationStatus = 'done';
          secondFactorControllerVm.keyCreationDate = secondFA.creationDate;
          secondFactorControllerVm.freeOTPConfig = angular.extend({
            account: secondFactorControllerVm.user.mail,
            secret: secondFA.sharedKey
          }, FREEOTP_CONFIGURATION)
          secondFactorControllerVm.freeOTPUri = makeFreeOTPUri(secondFactorControllerVm.freeOTPConfig);
          secondFactorAuthenticationTransitionService.deregisterHook();
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
