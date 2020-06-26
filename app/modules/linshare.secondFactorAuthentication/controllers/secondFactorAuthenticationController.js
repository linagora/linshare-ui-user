/**
 * secondFactorAuthenticationController Controller
 * @namespace LinShare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .controller('secondFactorAuthenticationController', secondFactorAuthenticationController);

  secondFactorAuthenticationController.$inject = ['user', 'secondFactorAuthentication'];

  /**
   * @namespace secondFactorAuthenticationController
   * @desc Application secondFactorAuthentication second factor authentication controller
   * @memberOf LinShare.secondFactorAuthentication
   */

  /* jshint maxparams: false, maxstatements: false */
  function secondFactorAuthenticationController(user, secondFactorAuthentication) {
    /* jshint validthis:true */
    var secondFactorAuthenticationVm = this;

    secondFactorAuthenticationVm.user = user;
    secondFactorAuthenticationVm.feature = secondFactorAuthentication;
  }
})();
