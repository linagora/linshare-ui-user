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
        templateUrl: 'modules/linshare.resetPassword/views/resetForm.html',
        controller: 'ResetPasswordController',
        controllerAs: 'resetVm',
        resolve: {
          resetUuid: function($stateParams) {
            return $stateParams.uuid;
          }
        }
      });
  }
})();
