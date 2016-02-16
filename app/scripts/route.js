'use strict';

angular.module('linshareUiUserApp')
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

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
      // USER DOCUMENTS
      //------------------------------

      .state('documents', {
        url: '/files',
        templateUrl: 'views/common/common.html'
      })

      .state('documents.files', {
        url:'/files',
        templateUrl: 'modules/linshare.document/views/list.html',
        controller: 'LinshareDocumentController',
        resolve: {
          documentsList: function(LinshareDocumentService) {
            return LinshareDocumentService.getAllFiles();
          }
        }
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
         }
        }
      })

      .state('documents.shared', {
        url:'/shared',
        templateUrl: 'modules/linshare.share/views/shared.html',
        controller: 'LinshareShareController',
        resolve: {
          sharedDocumentsList: function(LinshareShareService) {
            return LinshareShareService.getMyShares();
          }
        }
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
      })

      .state('administration', {
        url: '/lists',
        templateUrl: 'views/common/common.html'
      })

      //------------------------------
      // ADMINISTRATION
      //------------------------------

      .state('administration.lists', {
        url:'/lists',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })

      .state('administration.guests', {
        url:'/adminguests',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })

      .state('administration.users', {
        url:'/users',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })

      .state('administration.groups', {
        url:'/groups',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })

      //------------------------------
      // UPLOAD REQUESTS
      //------------------------------

      .state('upload_request', {
        url: '/upload_requests',
        templateUrl: 'views/common/common.html'
      })

      .state('upload_request.requests', {
        url:'/requests',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })
      .state('upload_request.propositions', {
        url:'/propositions',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })

      //------------------------------
      // AUDIT
      //------------------------------

      .state('audit', {
        url: '/audit',
        templateUrl: 'views/common/common.html'
      })

      .state('audit.global', {
        url:'/audit_global',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })
      .state('audit.upload_request', {
        url:'/audit_upload_request',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })

      //------------------------------
      // SHARE
      //------------------------------

      .state('share', {
        url: '/share',
        templateUrl: 'views/common/common.html'
      })

      .state('share.files', {
        url: '/advancedshare',
        templateUrl: 'modules/linshare.share/views/advancedSharing.html',
        params: {
          'selected': null,
          'hiddenParam': 'YES'
        },
        controller: 'LinshareShareActionController'
      })

      .state('share.files.new-share', {
        url:'/new_share',
        templateUrl: 'modules/linshare.share/views/new_advanced_sharing.html',
        controller: 'LinshareAdvancedShareController',
        resolve: {
          allFunctionalities: function(LinshareFunctionalityService) {
            return LinshareFunctionalityService.getAll();
          }
        }
      })

      .state('transfert', {
        url:'/transfert',
        templateUrl: 'views/common/common.html'
      })

      .state('transfert.test', {
        url: '/transfert',
        templateUrl: 'modules/linshare.share/views/partage_template.html',
        controller: 'nomController'
      })

      .state('share.files.share-detail', {
        url:'/share_detail',
        templateUrl: 'modules/linshare.share/views/shares_detail.html'
      })
    ;
  });
