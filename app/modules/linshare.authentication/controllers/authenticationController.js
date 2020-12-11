/**
 * Authentication controller
 * @namespace Authentication
 * @memberOf LinShare
 */
(function(){
  'use strict';

  angular
    .module('linshare.authentication')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$window', 'authenticationRestService', 'lsAppConfig', 'lsUserConfig'];

  /**
   * @namespace AuthenticationController
   * @desc Application authentication system controller
   * @memberOf LinShare.Authentication
   */
  function AuthenticationController($scope, $state, $window, authenticationRestService, lsAppConfig, lsUserConfig) {
    var authenticationVm = this;

    authenticationVm.logout = logout;
    authenticationVm.goToChangePassword = goToChangePassword;
    authenticationVm.changePasswordUrl = lsUserConfig.changePasswordUrl || lsAppConfig.changePasswordUrl;

    ////////////

    /**
     * @name logout
     * @desc Call logout from authenticationRestService
     * @memberOf LinShare.Authentication.AuthenticationController
     */
    function logout() {
      authenticationRestService.logout();
    }

    function goToChangePassword() {
      if ($scope.loggedUser.accountType === 'GUEST') {
        $state.go('changePassword');
      } else if ($scope.loggedUser.accountType === 'INTERNAL') {
        $window.open(authenticationVm.changePasswordUrl);
      }
    }
  }
})();
