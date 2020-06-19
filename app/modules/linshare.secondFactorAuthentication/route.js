/**
 * secondFactorAuthenticationConfig Config
 * @namespace LinShare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .config(secondFactorAuthenticationConfig);

  /**
   *  @namespace secondFactorAuthenticationConfig
   *  @desc Config of module secondFactorAuthentication
   *  @memberOf Linshare.secondFactorAuthentication
   */
  function secondFactorAuthenticationConfig($stateProvider) {
    $stateProvider
      .state('secondFactorAuthentication', {
        url: '/2fa',
        params: { loginInfo: null },
        templateUrl: 'modules/linshare.secondFactorAuthentication/views/second-factor-authentication.html',
        controller: 'secondFactorAuthenticationController',
        controllerAs: 'secondFactorAuthenticationVm',
        resolve: {
          params: function($state, $transition$, $stateParams) {
            if (!$stateParams.loginInfo) {
              $transition$.abort();
              $state.go('login');
            }
          }
        }
      })
  }
})();
