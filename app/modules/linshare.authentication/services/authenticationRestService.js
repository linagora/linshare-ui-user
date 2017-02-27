/**
 * Authentication service
 * @namespace LinShare.authentication
 */
(function() {
  'use strict';
  angular
    .module('linshare.authentication')
    .factory('authenticationRestService', authenticationRestService);

  authenticationRestService.$inject = ['$cookies', '$location', '$log', '$q', '$window', 'authService', 'lsAppConfig',
    'Restangular', 'ServerManagerService'
  ];

  /**
   * @namespace authenticationRestService
   * @desc Service to interact with User Authentication object by REST
   * @memberOf Linshare.authentication
   */
  function authenticationRestService($cookies, $location, $log, $q, $window, authService, lsAppConfig, Restangular,
    ServerManagerService) {
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
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function checkAuthentication() {
      $log.debug('AuthenticationRestService : checkAuthentication');
      return handler(Restangular.all(restUrl).withHttpConfig({
          ignoreAuthModule: true
      }).customGET('authorized'))
      .then(function(userLoggedIn) {
        deferred.resolve(userLoggedIn);
        return (userLoggedIn);
      }).catch(function(error) {
        deferred.reject(error);
        $log.debug('current user not authenticated', error);
        return error;
      });
    }

    /**
     * @name getCurrentUser
     * @desc get the current user connected
     * @return {Promise}
     * @memberOf Linshare.authentication.authenticationRestService
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
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function login(login, password) {
      deferred = $q.defer();
      $log.debug('AuthenticationRestService : login');
      /* globals Base64 */
      handler(Restangular.all(restUrl).withHttpConfig({
        ignoreAuthModule: true
      }).customGET('authorized', {}, {
        Authorization: 'Basic ' + Base64.encode(login + ':' + password)
      })).then(function(user) {
        authService.loginConfirmed(user);
        deferred.resolve(user);
      }).catch(function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    /**
     * @name logout
     * @desc Logout system of the App
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function logout() {
      $log.debug('AuthenticationRestService : logout');
      handler(Restangular.all(restUrl).one('logout').get()).then(function() {
        deferred = undefined;
        $log.info('Authentication logout : success');
        $cookies.remove('JSESSIONID');
        if (lsAppConfig.postLogoutUrl) {
          $window.location.href = lsAppConfig.postLogoutUrl;
        } else {
          var absUrl = $location.absUrl();
          $window.location = absUrl.split('#')[0];
        }
        authService.loginCancelled();
      }).catch(function(error) {
        $log.error('Authentication logout : failed', error.status);
      });
    }

    /**
     * @name version
     * @desc Get the version of the core API
     * @return {Promise} server response
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function version() {
      $log.debug('AuthenticationRestService : version');
      return handler(Restangular.one(restUrl, 'version').get());
    }
  }
})();
