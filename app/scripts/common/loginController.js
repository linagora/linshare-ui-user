/**
 * loginController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('loginController', loginController);

  loginController.$inject = [
    '$log',
    'authenticationRestService',
    'lsAppConfig',
    'toastService',
    'oidcService'
  ];

  /**
   * @namespace loginController
   * @desc Manage login page
   * @memberOf linshareUiUserApp
   */
  function loginController($log, authenticationRestService, lsAppConfig, toastService, oidcService) {
    const loginVm = this;

    loginVm.email = '';
    loginVm.lsAppConfig = lsAppConfig;
    loginVm.password = '';
    loginVm.submitForm = submitForm;
    loginVm.loginSSO = loginSSO;
    loginVm.oidcEnabled = lsAppConfig.oidcEnabled;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshareUiUserApp.loginController
     */
    function activate() {
      loginVm.inputType = lsAppConfig.loginWithMailOnly ? 'email' : 'text';
    }

    /**
     * @name submitForm
     * @desc Submit login form to login user
     * @memberOf linshareUiUserApp.loginController
     */
    function submitForm() {
      authenticationRestService.login(loginVm.email, loginVm.password)
        .then(user => toastService.info({
          key: 'LOGIN.NOTIFICATION.SUCCESS',
          params: {
            firstName: user.firstName
          }
        }))
        .catch(error => $log.debug('login error', error));
    }

    function loginSSO() {
      oidcService.signInRedirect();
    }
  }
})();
