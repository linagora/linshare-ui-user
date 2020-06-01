/**
 * changePasswordConfig Config
 * @namespace LinShare.changePassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.changePassword')
    .config(changePasswordConfig);

  /**
   *  @namespace changePasswordConfig
   *  @desc Config of module changePassword
   *  @memberOf LinShare.changePassword
   */
  function changePasswordConfig($stateProvider) {

    $stateProvider
      .state('changePassword', {
        parent: 'common',
        controller: 'changePasswordController',
        controllerAs: 'changePasswordVm',
        url: '/changePassword',
        templateUrl: 'modules/linshare.changePassword/views/form.html',
        resolve: {
          functionality: function($transition$, $state, user, lsAppConfig) {
            if (user.accountType !== lsAppConfig.accountType.guest) {
              $transition$.abort();
              $state.go('home');
            }
          },
          rules: function(changePasswordRestService) {
            return changePasswordRestService.getRules();
          }
        }
      })
  }
})();
