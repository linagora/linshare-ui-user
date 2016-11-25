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

  AuthenticationController.$inject = ['$scope', '$log', 'authenticationRestService'];

  /**
   * @namespace AuthenticationController
   * @desc Application authentication system controller
   * @memberOf LinShare.Authentication
   */
  function AuthenticationController($scope, $log, authenticationRestService) {
    /* jshint validthis: true */
    var authenticationVm = this;

    authenticationVm.logout = logout;

    ////////////

    /**
     * @name logout
     * @desc Call logout from authenticationRestService
     * @memberOf LinShare.Authentication.AuthenticationController
     */
    function logout() {
      authenticationRestService.logout();
    }
  }
})();
