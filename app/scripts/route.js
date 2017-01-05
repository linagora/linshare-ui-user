/**
 * routerConfiguration Config
 * @namespace LinShareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .config(routerConfiguration);

  routerConfiguration.$inject = ['$stateProvider', '$urlRouterProvider'];

  /**
   * @namespace routerConfiguration
   * @desc Router configuration for the LinShare APP
   * @memberOf LinShareUiUserApp
   */
  function routerConfiguration($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('common', {
        templateUrl: 'views/common/common.html',
        resolve: {
          authentication: function(authenticationRestService) {
            return authenticationRestService.checkAuthentication();
          },
          functionalities: function(functionalityRestService) {
            return functionalityRestService.getFunctionalities();
          }
        }
      })
      .state('home', {
        parent: 'common',
        url: '/',
        templateUrl: 'views/home/home.html',
        controller: 'HomeController'
      })
      .state('login', {
        url: '/login?next',
        templateUrl: 'views/common/loginForm.html'
      })
      .state('documents', {
        parent: 'common',
        controller: 'documentsController',
        url: '/files',
        template: '<div ui-view></div>'
      })
      .state('documents.files', {
        url: '/list',
        templateUrl: 'modules/linshare.document/views/documentsList.html',
        controller: 'documentController',
        params: {
          uploadedFileUuid: null
        },
        resolve: {
          documentsList: function(LinshareDocumentRestService) {
            return LinshareDocumentRestService.getList();
          }
        }
      })
      .state('documents.files.selected', {
        url: '/selected_files',
        templateUrl: 'modules/linshare.document/views/selected_files.html',
        controller: 'selectedDocumentsController',
        params: {
          'selected': null,
          'hiddenParam': 'YES'
        }
      })
      .state('documents.received', {
        url: '/received',
        templateUrl: 'modules/linshare.receivedShare/views/list.html',
        controller: 'ReceivedController',
        resolve: {
          user: function(authenticationRestService) {
            return authenticationRestService.getCurrentUser();
          },
          files: function(receivedShareRestService) {
            return receivedShareRestService.getList();
          }
        }
      })
      .state('documents.shared', {
        url: '/shared',
        templateUrl: 'modules/linshare.share/views/shared.html',
        controller: 'LinshareShareController',
        resolve: {
          sharedDocumentsList: function(LinshareShareService) {
            return LinshareShareService.getList();
          }
        }
      })
      .state('documents.share', {
        url: '/share',
        templateUrl: 'views/documents/shareModal.html',
        controller: 'ReceivedController'
      })
      .state('documents.upload', {
        url: '/upload/:from',
        params: {
          idUpload: null
        },
        templateUrl: 'modules/linshare.upload/views/lsUpload.html',
        controller: 'uploadQueueController',
        controllerAs: 'uploadQueueVm',
        resolve: {
          checkUrl: function($state, $stateParams, lsAppConfig) {
            if ($stateParams.from !== lsAppConfig.mySpacePage && $stateParams.from !== lsAppConfig.workgroupPage) {
              $state.go('documents.upload', {
                'from': lsAppConfig.mySpacePage
              });
            }
          }
        }
      })
      .state('documents.profile', {
        url: '/profile',
        templateUrl: 'views/common/user-profile.html',
        controller: 'AuthenticationController',
        controllerAs: 'authenticationVm'
      })
      .state('sharedspace', {
        parent: 'common',
        url: '/sharedspace',
        template: '<div ui-view></div>'
      })
      .state('sharedspace.all', {
        url: '/list',
        templateUrl: 'modules/linshare.sharedSpace/views/workgroups.html',
        controller: 'SharedSpaceController as vm',
        resolve: {
          workgroups: function(workgroupRestService) {
            return workgroupRestService.getList();
          }
        }
      })
      .state('sharedspace.workgroups', {
        url: '/workgroups',
        template: '<div ui-view></div>',
        resolve: {
          workgroupList: function(workgroupRestService) {
            return workgroupRestService.getList();
          }
        }
      })
      .state('sharedspace.workgroups.entries', {
        url: '/:uuid/:workgroupName/folders/:parent/:folderUuid/:folderName',
        templateUrl: 'modules/linshare.sharedSpace/views/list-files.html',
        controller: 'SharedSpaceListController as sharedSpaceListVm',
        params: {
          uploadedFileUuid: null
        },
        resolve: {
          currentWorkGroup: function(workgroupFoldersRestService, $stateParams) {
            return workgroupFoldersRestService.getParent($stateParams.uuid, $stateParams.folderUuid);
          }
        }
      })
      .state('administration', {
        parent: 'common',
        url: '/administration',
        template: '<div ui-view></div>'
      })
      .state('administration.contactslists', {
        url: '/contactslists/:from',
        params: {
          createNew: undefined
        },
        templateUrl: 'modules/linshare.contactsLists/views/contactsListsList.html',
        controller: 'contactsListsListController',
        controllerAs: 'contactsListsListVm',
        resolve: {
          checkUrl: function($state, $stateParams, lsAppConfig) {
            if ($stateParams.from.length === 0) {
              $stateParams.from = lsAppConfig.contactsListsMinePage;
            } else if ($stateParams.from !== lsAppConfig.contactsListsMinePage && $stateParams.from !== lsAppConfig.contactsListsOthersPage) {
              return $state.go('administration.contactslists', {
                from: lsAppConfig.contactsListsMinePage
              });
            }
          },
          createNew: function($stateParams) {
            return _.isUndefined($stateParams.createNew) ? false : $stateParams.createNew;
          },
          contactsListsList: function($stateParams, lsAppConfig, contactsListsListRestService) {
            return contactsListsListRestService.getList($stateParams.from !== lsAppConfig.contactsListsOthersPage);
          }
        }
      })
      .state('administration.contactslists.contacts', {
        url: '/:contactsListUuid/:contactsListName/contacts',
        params: {
          addContacts: undefined
        },
        templateUrl: 'modules/linshare.contactsLists/views/contactsListsContacts.html',
        controller: 'contactsListsContactsController',
        controllerAs: 'contactsListsContactsVm',
        resolve: {
          addContacts: function($stateParams) {
            return _.isUndefined($stateParams.addContacts) ? false : $stateParams.addContacts;
          },
          contactsListsContacts: function(contactsListsContactsRestService, $stateParams) {
            return contactsListsContactsRestService.getList($stateParams.contactsListUuid);
          }
        }
      })
      .state('administration.guests', {
        url: '/adminguests',
        templateUrl: 'modules/linshare.guests/views/list.html',
        controller: 'LinshareGuestsController',
        controllerAs: 'guestVm',
      })
      .state('administration.users', {
        url: '/users',
        templateUrl: 'views/home/main.html',
      })
      .state('administration.groups', {
        url: '/sharedspace',
        templateUrl: 'views/home/main.html',
      })
      .state('administration.hidden_links', {
        url: '/hidden_links',
        templateUrl: 'views/common/hidden_links.html'
      })
      .state('upload_request', {
        parent: 'common',
        url: '/upload_requests',
        template: '<div ui-view></div>'
      })
      .state('audit', {
        parent: 'common',
        url: '/audit',
        template: '<div ui-view></div>'
      })
      .state('audit.global', {
        url: '/audit_global',
        templateUrl: 'views/home/main.html',
      })
      .state('audit.upload_request', {
        url: '/audit_upload_request',
        templateUrl: 'views/home/main.html',
      })
      .state('share', {
        parent: 'common',
        url: '/share',
        template: '<div ui-view></div>'
      })
      .state('share.detail', {
        url: '/view/:id',
        templateUrl: 'modules/linshare.share/views/shares_detail.html',
        controller: 'LinshareShareListController',
        controllerAs: 'shareListVm',
        resolve: {
          previousState: function($state) {
            var currentStateData = {
              Name: $state.current.name,
              Params: $state.params
            };
            return currentStateData;
          },
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
        url: '/new_share',
        templateUrl: 'modules/linshare.share/views/new_advanced_sharing.html',
        controller: 'LinshareAdvancedShareController',
        resolve: {
          allFunctionalities: function(functionalityRestService) {
            return functionalityRestService.getAll();
          }
        }
      })
      .state('transfert', {
        parent: 'common',
        url: '/transfert',
        template: '<div ui-view></div>'
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
        url: '/share_detail',
        templateUrl: 'modules/linshare.share/views/shares_detail.html'
      });
  }
})();
