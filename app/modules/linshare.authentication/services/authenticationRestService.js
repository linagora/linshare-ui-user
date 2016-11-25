/**
 * Authentication service
 * @namespace LinShare.authentication
 */
(function() {
  'use strict';
  angular
    .module('linshare.authentication')
    .factory('authenticationRestService', authenticationRestService);

  authenticationRestService.$inject = ['$cookies', '$location', '$log', '$q', '$timeout', '$translate', '$window',
    'authService', 'growlService', 'lsAppConfig', 'Restangular', 'ServerManagerService'
  ];

  /**
   * @namespace authenticationRestService
   * @desc Service to interact with User Authentication object by REST
   * @memberOf Linshare.Authentication
   */
  function authenticationRestService($cookies, $location, $log, $q, $timeout, $translate, $window,
    authService, growlService, lsAppConfig, Restangular, ServerManagerService) {
    var
      deferred = $q.defer(),
      handler = ServerManagerService.responseHandler,
      restUrl = 'authentication',
      service = {
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
     * @memberOf Linshare.Authentication.authenticationRestService
     */
    function checkAuthentication() {
      $log.debug('AuthenticationRestService : checkAuthentication');
      handler(Restangular.all(restUrl).customGET('authorized'))
        .then(function(userLoggedIn) {
          deferred.resolve(userLoggedIn);
        }, function(error) {
          $log.debug('current user not authenticated', error);
        });
    }

    /**
     * @name getCurrentUser
     * @desc get the current user connected
     * @return {Promise}
     * @memberOf Linshare.Authentication.authenticationRestService
     */
    function getCurrentUser() {
      $log.debug('AuthenticationRestService : getCurrentUser');
      return deferred.promise;
    }

    /**
     * @name login
     * @desc Login system of the App
     * @param {string} login - Login of the user
     * @param {string} password - Password of the user
     * @return {Promise} server response
     * @memberOf Linshare.Authentication.authenticationRestService
     */
    function login(login, password) {
      $log.debug('AuthenticationRestService : login');
      /* globals Base64 */
      return handler(Restangular.all(restUrl).customGET('authorized', {
        //while the all requests have no auth header we need to ignote authmodule
        ignoreAuthModule: true
      }, {
        Authorization: 'Basic ' + Base64.encode(login + ':' + password)
      })).then(function(user) {
        $log.debug('Authentication success : logged as ' + user.firstName + ' ' + user.lastName + '');
        authService.loginConfirmed(user);
        deferred.resolve(user);
        var swalWelcome;
        $translate(['WELCOME_USER'])
          .then(function(translations) {
            /* jshint sub: true */
            swalWelcome = translations['WELCOME_USER'];
          });
        $timeout(function() {
          var welcomeUserName = swalWelcome + user.firstName;
          growlService.notifyTopRight(welcomeUserName, 'inverse');
        }, 350);

      }, function(error) {
        $log.error('Authentication failed', error.status);
        deferred.reject(error);
      });
    }

    /**
     * @name logout
     * @desc Logout system of the App
     * @memberOf Linshare.Authentication.authenticationRestService
     */
    function logout() {
      $log.debug('AuthenticationRestService : logout');
      handler(Restangular.all(restUrl).one('logout').get())
        .then(function() {
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
    }

    /**
     * @name version
     * @desc Get the version of the core API
     * @return {Promise} server response
     * @memberOf Linshare.Authentication.authenticationRestService
     */
    function version() {
      $log.debug('AuthenticationRestService : version');
      return handler(Restangular.one(restUrl, 'version').get());
    }
  }
})();
