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
        controller: 'DocumentsController',
        url: '/files',
        template:'<div ui-view></div>'
      })

      .state('documents.files', {
        url:'/list',
        templateUrl: 'modules/linshare.document/views/list.html',
        controller: 'LinshareDocumentController',
        resolve: {
          documentsList: function(LinshareDocumentRestService) {
            return LinshareDocumentRestService.getAllFiles();
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

      .state('documents.upload', {
        url: '/upload',
        templateUrl: 'modules/linshare.document/views/upload_template.html'
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

      //------------------------------
      // SHARESPACE - WORKGROUP
      //------------------------------

      .state('sharedspace', {
        parent: 'common',
        url: '/sharedspace',
        template:'<div ui-view></div>'
      })

      .state('sharedspace.all', {
        url:'/list',
        templateUrl: 'modules/linshare.sharedSpace/views/workgroups.html',
        controller: 'SharedSpaceController as vm',
        resolve: {
          workgroups: function(workGroupRestService) {
            return workGroupRestService.getAllWorkGroups();
          }
        }
      })

      .state('sharedspace.all.detail', {
        url:'/:id/members',
        template: '<aside id="chat" data-ng-include src="\'views/includes/sidebar-right.html\'"'+
        'data-ng-class="{ \'toggled\': mactrl.sidebarToggle.right === true }" class="sidebar-right">' +
        '</aside>',
        controller: 'WorkGroupMembersController as wkgrpmemberctrl',
        resolve: {
          members: function(workGroupRestService, $stateParams) {
            return workGroupRestService.getAllMembers($stateParams.id);
          },
          currentWorkgroup: function(workGroupRestService, $stateParams) {
            return workGroupRestService.getWorkGroup($stateParams.id);
          }
        }
      })


      .state('sharedspace.workgroups', {
        url:'/workgroups',
        //controller: 'WorkGroupController',
        template: '<div ui-view></div>',
        resolve: {
          workGroupList: function(workGroupRestService) {
            return workGroupRestService.getAllWorkGroups();
          }
        }
      })

      .state('sharedspace.workgroups.target', {
        url:'/:uuid/:workgroupName',
        templateUrl: 'modules/linshare.sharedSpace/views/list-files.html',
        controller: 'SharedSpaceListController as vm',
        resolve: {
          currentWorkGroup: function(workGroupRestService, $stateParams) {
            return workGroupRestService.getWorkGroupContents($stateParams.uuid);
          }
        }
      })

      //------------------------------
      // ADMINISTRATION
      //------------------------------

      .state('administration', {
        parent: 'common',
        url: '/administration',
        template:'<div ui-view></div>'
      })


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
        url:'/sharedspace',
        templateUrl: 'views/home/main.html',
        controller: 'LinshareGuestController'
      })

      .state('administration.hidden_links', {
        url:'/hidden_links',
        templateUrl: 'views/common/hidden_links.html'
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
        parent: 'common',
        url: '/share',
        template:'<div ui-view></div>'
      })

      .state('share.detail', {
        url: '/view/:id',
        templateUrl: 'modules/linshare.share/views/shares_detail.html',
        controller: 'shareDetailController',
        resolve: {
          shareIndex: function($stateParams) {
            return $stateParams.id;
          }
        }
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
