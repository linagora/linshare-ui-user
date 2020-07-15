/**
 * resetPasswordConfig Config
 * @namespace LinShare.resetPassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.resetPassword')
    .config(resetPasswordConfig);

  /**
   *  @namespace resetPasswordConfig
   *  @desc Config of module resetPassword
   *  @memberOf LinShare.resetPassword
   */
  function resetPasswordConfig($stateProvider) {
    $stateProvider
      .state('reset', {
        url: '/external/reset/:uuid',
        params: {
          uuid: ''
        },
        template: require('./views/resetForm.html'),
        controller: 'ResetPasswordController',
        controllerAs: 'resetVm',
        resolve: {
          resetUuid: function($transition$) {
            return $transition$.params().uuid;
          }
        }
      });
  }
})();
