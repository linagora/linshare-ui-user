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

  AuthenticationController.$inject = ['$scope', '$state', '$window', 'authenticationRestService', 'lsAppConfig'];

  /**
   * @namespace AuthenticationController
   * @desc Application authentication system controller
   * @memberOf LinShare.Authentication
   */
  function AuthenticationController($scope, $state, $window, authenticationRestService, lsAppConfig) {
    var authenticationVm = this;

    authenticationVm.logout = logout;
    authenticationVm.goToChangePassword = goToChangePassword;
    authenticationVm.canChangePassword = canChangePassword;
    authenticationVm.changePasswordUrl = lsAppConfig.changePasswordUrl;
    authenticationVm.hideLogout = lsAppConfig.hideLogout;

    ////////////

    /**
     * @name logout
     * @desc Call logout from authenticationRestService
     * @memberOf LinShare.Authentication.AuthenticationController
     */
    function logout() {
      authenticationRestService.logout();
    }

    function canChangePassword() {
      return $scope.loggedUser.accountType === 'GUEST' || authenticationVm.changePasswordUrl;
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
