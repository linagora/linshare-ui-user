'use strict';

angular.module('linshareUiUserApp')
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('home', {
        url:'/',
        templateUrl: 'views/home/home.html',
        controller: 'HomeController',
        resolve: {
          user: function(AuthenticationService) {
            return AuthenticationService.getCurrentUser();
          }
        }
      })

      //------------------------------
      // LOGIN
      //------------------------------

      .state('login', {
        url:'/login?next',
        templateUrl: 'views/common/loginForm.html'
      })


      //------------------------------
      // RECEIVED DOCUMENT
      //------------------------------

      .state('documents', {
        url: '',
        templateUrl: 'views/common/common.html'
      })

      .state('documents.files', {
        url:'/files',
        templateUrl: 'modules/linshare.document/views/list.html',
        controller: 'LinshareDocumentController'
        //resolve: {
        //  user: function(AuthenticationService) {
        //    console.log('curentuser from files resolve' , AuthenticationService.getCurrentUser());
        //    return AuthenticationService.getCurrentUser();
        //  }
        //}
      })


      .state('documents.received', {
        url:'/received',
        templateUrl: 'modules/linshare.receivedShare/views/list.html',
        controller: 'ReceivedController',
        resolve: {
          user: function(AuthenticationService) {
            return AuthenticationService.getCurrentUser();
          },
          files: function(LinshareReceivedShareService) {
           return LinshareReceivedShareService.getReceivedShares();
           // .then(function(files){
           // });
         }
        }
      })

      .state('documents.shared', {
        url:'/shared',
        templateUrl: 'views/documents/shared.html',
        controller: 'SharedController'
      })

      .state('documents.share', {
        url:'/share',
        templateUrl: 'views/documents/shareModal.html',
        controller: 'ReceivedController'
      })

      .state('documents.threads', {
        url:'/threads',
        templateUrl: 'views/threads/thread.html',
        controller: 'ThreadController'
      })
      .state('documents.profile', {
        url: '/profile',
        templateUrl: 'views/common/user-profile.html',
        controller: 'AuthenticationController'
      })
      .state('documents.guests', {
        url: '/guests',
        templateUrl: 'views/guests/guestList.html',
        controller: 'LinshareGuestController',
        resolve: {
          guestList: function(LinshareGuestService) {
            return LinshareGuestService.getList();
          }
        }
      })
      .state('documents.guests.uuid', {
        url:'/guests/:uuid',
        templateUrl: 'views/guests/guestDetails.html',
        controller: 'LinshareGuestController'
      });
  });
