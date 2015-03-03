'use strict';

/**
 * @ngdoc overview
 * @name linshareUiUserApp
 * @description
 * # linshareUiUserApp
 *
 * Main module of the application.
 */
angular
  .module('linshareUiUserApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'restangular'
  ])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl('linshare');
    RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json'});
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: '../views/common/loginForm.html',
        controller: 'LoginController'
      })
      .when('/files', {
        templateUrl: 'views/files.html',
        controller: 'FilesController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
