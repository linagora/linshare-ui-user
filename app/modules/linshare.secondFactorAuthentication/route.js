/**
 * secondFactorAuthenticationConfig Config
 * @namespace LinShare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .config(secondFactorAuthenticationConfig)
    .run(registerTransitionHook)

  /**
   *  @namespace secondFactorAuthenticationConfig
   *  @desc Config of module secondFactorAuthentication
   *  @memberOf Linshare.secondFactorAuthentication
   */
  function secondFactorAuthenticationConfig($stateProvider, $transitionsProvider) {
    $stateProvider
      .state('secondFactorAuthenticationLogin', {
        url: '/2fa',
        params: { loginInfo: null },
        templateUrl: 'modules/linshare.secondFactorAuthentication/views/secondFactorAuthenticationLogin.html',
        controller: 'secondFactorAuthenticationLoginController',
        controllerAs: 'secondFactorAuthenticationLoginVm',
        resolve: {
          params: function($state, $transition$, $stateParams) {
            if (!$stateParams.loginInfo) {
              $transition$.abort();
              $state.go('login');
            }
          }
        }
      })
      .state('secondFactorAuthentication', {
        parent: 'common',
        controller: 'secondFactorAuthenticationController',
        controllerAs: 'secondFactorAuthenticationVm',
        url: '/secondFactorAuthentication',
        templateUrl: 'modules/linshare.secondFactorAuthentication/views/secondFactorAuthentication.html',
        resolve: {
          functionality: function($transition$, $state, user, lsAppConfig) {
            if (
              user.accountType !== lsAppConfig.accountType.internal &&
              user.accountType !== lsAppConfig.accountType.guest
            ) {
              $transition$.abort();
              $state.go('home');
            }
          },
          secondFactorAuthentication: function(user, secondFactorAuthenticationRestService) {
            return secondFactorAuthenticationRestService.getStatus(user.uuid);
          }
        }
      });
  }

  registerTransitionHook.$inject = ['secondFactorAuthenticationTransitionService']

  /**
   * @namespace registerTransitionHook
   * @desc Register a transition hook that will redirect to 2FA setup page
   *       if 2FA feature is required and not yet enabled for current user,
   *       otherwise the hook is deregistered.
   * @memberOf Linshare.secondFactorAuthentication
   */
  function registerTransitionHook(secondFactorAuthenticationTransitionService) {
    secondFactorAuthenticationTransitionService.registerHook();
  }
})();
