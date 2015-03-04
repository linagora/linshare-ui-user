'use strict';

/* Authentication Factory */

angular.module('linshareUiUserApp')
  .factory('AuthenticationService', function(Restangular, $q, $log, $cookies, authService) {
    var deferred = $q.defer();

    var baseAuthentication = Restangular.all('authentication');
    /*
     Check if the user is authorized
     */
    baseAuthentication.customGET('authorized')
      .then( function (userLoggedIn){
        return userLoggedIn;
      }, function(error) {
        $log.debug('authentication error', error);
      });

    return {
      login: function (login, password) {
        $log.debug('Authentication:login');
        return baseAuthentication.customGET('authorized',{
          //while the all requests have no auth header we need to ignote authmodule
          ignoreAuthModule: true}, {
          Authorization: 'Basic ' + Base64.encode(login + ':' + password)
        }).then(function(user) {
          $log.debug('Authentication success : logged as ' + user.firstName + ' ' + user.lastName);
          authService.loginConfirmed();
          deferred.resolve(user);
        }, function(error) {
          $log.error('Authentication failed', error.status);
          deferred.reject(error);
        });
      },
      logout: function() {
        $log.debug('Authentication:changePassword');
        baseAuthentication.one('logout').get()
          .then(function() {
            delete $cookies.JSESSIONID;
            //After being disconnected, authentication model is reloaded
            //you can use $location to redirect through home page (login page)
            //baseAuthentication.customGET('authorized').then(function(user) {
            //  deferred.resolve(user);
            //});
          });
      },
      getCurrentUser: function() {
        //baseAuthentication.customGET('authorized')
        //  .then(function(user) {
        //    deferred.resolve(user);
            return deferred.promise;
         //});
      }
    };
  });
