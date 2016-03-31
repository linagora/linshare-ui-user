'use strict';

angular.module('linshareUiUserApp')
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider

      //------------------------------
      // COMMON TEMPLATE
      //------------------------------

      .state('common', {
        templateUrl: 'views/common/common.html'
      })

      .state('home', {
        parent: 'common',
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
        parent: 'common',
        url: '/files',
        template:'<div ui-view></div>'
      })

      .state('documents.files', {
        url:'/list',
        templateUrl: 'modules/linshare.document/views/list.html',
        controller: 'LinshareDocumentController',
        resolve: {
          documentsList: function(LinshareDocumentService) {
            return LinshareDocumentService.getAllFiles();
          }
        }
      })


      .state('documents.files.selected', {
        url:'/selected_files',
        templateUrl: 'modules/linshare.document/views/selected_files.html',
        controller: 'LinshareSelectedDocumentsController',
        params: {
          'selected': null,
          'hiddenParam': 'YES'
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

      .state('documents.files.upload', {
        url: '/upload',
        templateUrl: 'modules/linshare.document/views/upload_template.html'
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
        parent: 'common',
        url: '/administration',
        template:'<div ui-view></div>'
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

      .state('administration.hided_links', {
        url:'/hided_links',
        templateUrl: 'views/common/hided_links.html'
      })

      //------------------------------
      // UPLOAD REQUESTS
      //------------------------------

      .state('upload_request', {
        parent: 'common',
        url: '/upload_requests',
        template:'<div ui-view></div>'
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
        parent: 'common',
        url: '/audit',
        template:'<div ui-view></div>'
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
        parent: 'common',
        url:'/transfert',
        template:'<div ui-view></div>'
      })

      .state('transfert.new_share', {
        url: '/newShare',
        templateUrl: 'modules/linshare.share/views/partage_template.html'
      })

      .state('transfert.new_upload', {
        url: '/newUpload',
        templateUrl: 'modules/linshare.share/views/upload_template.html'
      })

      .state('share.files.share-detail', {
        url:'/share_detail',
        templateUrl: 'modules/linshare.share/views/shares_detail.html'
      })
    ;
  });
