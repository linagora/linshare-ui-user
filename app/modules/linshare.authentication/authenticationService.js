'use strict';
/**
 * @ngdoc overview
 * @name linshare.Authentication
 */
/*jshint sub:true*/
angular.module('linshare.authentication', ['restangular', 'http-auth-interceptor'])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl('linshare');
    RestangularProvider.setDefaultHttpFields({cache: false});
    RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json;'});
    RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers) {
      headers['WWW-No-Authenticate'] = 'linshare';
    });
  })
  .factory('AuthenticationService', ['Restangular', '$q', '$log', 'authService', '$timeout', 'growlService', '$translate',
    function (Restangular, $q, $log, authService, $timeout, growlService, $translate) {
      var deferred = $q.defer();

      var baseAuthentication = Restangular.all('authentication');

      /*
       Check if the user is authorized
       */
      // baseAuthentication.customGET('authorized')
      //   .then(function (userLoggedIn) {
      //     deferred.resolve(userLoggedIn);
      //     $log.debug('current user not authenticated ---------------------' );
      //   }, function (error) {
      //     $log.debug('current user not authenticated', error);
      //   });

      return {
        login: function (login, password) {
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
        },
        logout: function () {
          $log.debug('Authentication:logout');
          baseAuthentication.one('logout').get()
            .then(function () {
              authService.loginCancelled();
              //After being disconnected, authentication model is reloaded
              //you can use $location to redirect through home page (login page)
              Restangular.all('authentication').customGET('authorized').then(function (user) {
                deferred.resolve(user);
              });
            });
        },
        getCurrentUser: function () {
          console.log('')
          return deferred.promise;
        }
      };
    }]);
