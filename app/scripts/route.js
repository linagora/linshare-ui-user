'use strict';

angular.module('linshareUiUserApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: function(LinshareUserService) {
          if(!LinshareUserService.isLoggedIn) {
            return 'views/common/loginForm.html';
          } else {
            return 'views/home/home.html';
          }
        }
      })
      .when('/home', {
        templateUrl: 'views/home/home.html',
        controller: 'HomeController',
        resolve: {
          user: function(AuthenticationService){
            return AuthenticationService.getCurrentUser();
          }
        }
      })
      .when('/login', {
        templateUrl: 'views/common/loginForm.html',
        controller: 'AuthenticationController'
      })
      .when('/files', {
        templateUrl: 'views/documents/list.html',
        controller: 'LinshareDocumentController',
        resolve: {
          user: function(AuthenticationService) {
            console.log('curentuser from files resolve' , AuthenticationService.getCurrentUser());
            return AuthenticationService.getCurrentUser();
          }
        }
      })
      .when('/received', {
        templateUrl: 'views/documents/received.html',
        controller: 'ReceivedController',
        resolve: {
          user: function(AuthenticationService) {
            return AuthenticationService.getCurrentUser();
          }
        }
      })
      .when('/shared', {
        templateUrl: 'views/documents/shared.html',
        controller: 'SharedController'
      })
      .when('/share', {
        templateUrl: 'views/documents/shareModal.html',
        controller: 'ReceivedController'
      })
      .when('/threads', {
        templateUrl: 'views/threads/thread.html',
        controller: 'ThreadController'
      })
      .when('/profile', {
        templateUrl: 'views/common/user-profile.html',
        controller: 'AuthenticationController'
      })
      .when('/guests', {
        templateUrl: 'views/guests/guestList.html',
        controller: 'LinshareGuestController',
        resolve: {
          guestList: function(LinshareGuestService) {
            return LinshareGuestService.getList();
          }
        }
      })
      .when('/guests/:uuid', {
        templateUrl: 'views/guests/guestDetails.html',
        controller: 'LinshareGuestController'
      })
      .otherwise({
        redirectTo: '/home'
      });
  });
