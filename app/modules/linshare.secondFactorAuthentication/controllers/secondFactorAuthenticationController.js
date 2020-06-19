/**
 * secondFactorAuthenticationController Controller
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication', [])
    .controller('secondFactorAuthenticationController', secondFactorAuthenticationController);

  secondFactorAuthenticationController.$inject = ['$stateParams', '$location', 'authenticationRestService', 'toastService', 'lsAppConfig']

  /**
   *  @namespace secondFactorAuthenticationController
   *  @desc Second factor authentication management system controller
   *  @memberOf linshare.secondFactorAuthentication
   */
  function secondFactorAuthenticationController($stateParams, $location, authenticationRestService, toastService, lsAppConfig) {
    /* jshint validthis: true */
    var secondFactorAuthenticationVm = this;

    secondFactorAuthenticationVm.lsAppConfig = lsAppConfig;
    secondFactorAuthenticationVm.submitForm = submitForm;
    secondFactorAuthenticationVm.login = $stateParams.loginInfo.login;
    secondFactorAuthenticationVm.password = $stateParams.loginInfo.password;

    /**
     * @name submitForm
     * @desc Submit login form to login user with otp
     * @memberOf linshare.secondFactorAuthentication
     */
    function submitForm() {
      authenticationRestService.loginWithOTP(
        secondFactorAuthenticationVm.login,
        secondFactorAuthenticationVm.password,
        secondFactorAuthenticationVm.otp
      ).then(function(user) {
        toastService.info({
          key: 'LOGIN.NOTIFICATION.SUCCESS',
          params: {
            firstName: user.firstName
          }
        });
      }).catch(function(error) {
        secondFactorAuthenticationVm.otp = '';

        if (error && error.status === 401 && error.code === '1003') {
          toastService.error({ key: error.message });
        }
      });
    }
  }
})();
