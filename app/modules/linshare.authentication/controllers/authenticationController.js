/**
 * Authentication controller
 * @namespace Authentication
 * @memberof Linshare
 */
(function(){
'use strict';

angular
  .module('linshare.authentication')
  .controller('AuthenticationController', AuthenticationController)
   
  AuthenticationController.$inject = ['$scope', '$log', 'AuthenticationService'];

  /**
   * @namespace AuthenticationController
   * @desc Application authtentication system controller
   * @memberOf Linshare.Authentication 
   */ 
  function AuthenticationController($scope, $log, AuthenticationService) {
    /* jshint validthis: true */
    var authenticationVm = this;

    authenticationVm.logout = logout;
    
    //////////// 
   
    /**
     * @name logout
     * @desc Call logout from AuthentificationService
     * @memberOf Linshare.Authentication.AuthenticationController
     */
    function logout() {
      AuthenticationService.logout();
    };
  }
})();
