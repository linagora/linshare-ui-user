/**
 * Authentication service
 * @namespace Authentication
 * @memberOf Linshare
 */
(function() {
  'use strict';
  angular
    .module('linshare.authentication')
    .factory('AuthenticationService', AuthenticationService)
  
  AuthenticationService.$inject = ['Restangular', '$q', '$log', '$translate', '$cookies', '$location', '$window',
                                  '$timeout', 'authService', 'growlService', 'lsAppConfig'];

  /**
   * @namespace AuthenticationService
   * @desc Application authentication system service
   * @memberOf Linshare.Authentication
   */    
  function AuthenticationService(Restangular, $q, $log, $translate, $cookies, $location, $window, $timeout,
                                authService, growlService, lsAppConfig) {
    var baseAuthentication = Restangular.all('authentication');
    var deferred = $q.defer();
    var service = {
      checkAuthentication: checkAuthentication,
      getCurrentUser: getCurrentUser,
      login: login,
      logout: logout,
      version: version
    };

    return service; 

    ////////////
    
    /**
     * @name checkAuthentication
     * @desc Check user atuhorization
     * @memberOf Linshare.Authentication.AuthenticationService
     */
    function checkAuthentication() {
      baseAuthentication.customGET('authorized')
        .then(function(userLoggedIn) {
          deferred.resolve(userLoggedIn);
        }, function(error) {
          $log.debug('current user not authenticated', error);
        });
    };

    /**
     * @name getCurrentUser
     * @desc get the current user connected
     * @return {promise}
     * @memberOf Linshare.Authentication.AuthenticationService
     */
    function getCurrentUser() {
      return deferred.promise;
    };

    /**
     * @name login
     * @desc Login system of the App
     * @param {string} login - Login of the user
     * @param {string} password - Password of the user
     * @memberOf Linshare.Authentication.AuthenticationService
     */
    function login(login, password) {
      $log.debug('Authentication:login');
      /* globals Base64 */
      return baseAuthentication.customGET('authorized', {
        //while the all requests have no auth header we need to ignote authmodule
        ignoreAuthModule: true
      }, {
        Authorization: 'Basic ' + Base64.encode(login + ':' + password)
      }).then(function (user) {
        $log.debug('Authentication success : logged as ' + user.firstName + ' ' + user.lastName + '');
        authService.loginConfirmed(user);
        deferred.resolve(user);
        var swalWelcome;
        $translate(['WELCOME_USER'])
          .then(function(translations) {
            swalWelcome = translations['WELCOME_USER'];
          });
        $timeout(function() {
          var welcomeUserName = swalWelcome + user.firstName;
          growlService.notifyTopRight(welcomeUserName, 'inverse');
        }, 350);
  
      }, function (error) {
        $log.error('Authentication failed', error.status);
        deferred.reject(error);
      });
    };

    /**
     * @name logout
     * @desc Logout system of the App
     * @memberOf Linshare.Authentication.AuthenticationService
     */
    function logout() {
      $log.debug('Authentication:logout');
      baseAuthentication.one('logout').get()
        .then(function () {
          $log.info('Authentication logout : success');
          authService.loginCancelled();
          $cookies.remove('JSESSIONID');
          if (lsAppConfig.postLogoutUrl) {
              $window.location.href = lsAppConfig.postLogoutUrl;
          } else {
              var absUrl = $location.absUrl();
              $window.location = absUrl.split('#')[0];
          }
        },
        function(error) {
          $log.error('Authentication logout : failed', error.status);
        });
    };
    
    /**
     * @name version
     * @desc Get the version of the core API
     * @return {restangularObject} 
     * @memberOf Linshare.Authentication.AuthenticationService
     */
    function version() {
      $log.debug('Authentication:version');
      return Restangular.one('authentication', 'version').get();
    };
  }
})(); 
