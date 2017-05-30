/**
 * routerConfiguration Config
 * @namespace LinShareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .config(routerConfiguration);

  routerConfiguration.$inject = ['_', '$stateProvider', '$urlRouterProvider'];

  /**
   * @namespace routerConfiguration
   * @desc Router configuration for the LinShare APP
   * @memberOf LinShareUiUserApp
   */
  function routerConfiguration(_, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise(function($injector) {
      $injector.invoke(['$state', 'authenticationRestService', function($state, authenticationRestService) {
        authRedirect($state, authenticationRestService);
      }]);
    });

    $stateProvider
      .state('common', {
        templateUrl: 'views/common/common.html',
        resolve: {
          authentication: function(authenticationRestService) {
            return authenticationRestService.checkAuthentication();
          },
          user: function(authenticationRestService) {
            return authenticationRestService.getCurrentUser();
          },
          functionalities: function(functionalityRestService) {
            return functionalityRestService.getFunctionalities();
          }
        }
      })
      .state('home', {
        parent: 'common',
        url: '/home',
        templateUrl: 'views/home/home.html',
        controller: 'HomeController',
        resolve: {
          user: function(user) {
            return user;
          },
          functionalities: function(functionalities) {
            return functionalities;
          }
        }
      })
      .state('login', {
        url: '/login?next',
        templateUrl: 'views/common/loginForm.html',
        controller: 'loginController',
        controllerAs: 'loginVm',
        params: {
          loginRequired: undefined
        },
        resolve: {
          authentication: function($state, $stateParams, authenticationRestService) {
           if (!$stateParams.loginRequired) {
            authRedirect($state, authenticationRestService);
           }
          }
        }
      })
      .state('documents', {
        parent: 'common',
        controller: 'documentsController',
        url: '/files',
        template: '<div ui-view></div>'
      })
      .state('documents.files', {
        url: '/list?fileUuid',
        templateUrl: 'modules/linshare.document/views/documentsList.html',
        controller: 'documentController',
        params: {
          uploadedFileUuid: null
        },
        resolve: {
          functionality: function($state, functionalities, user) {
            if (!user.canUpload) {
              $state.go('home');
            }
          },
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
        url: '/received?fileUuid',
        templateUrl: 'modules/linshare.receivedShare/views/list.html',
        controller: 'ReceivedController',
        resolve: {
          user: function(user) {
            return user;
          },
          files: function(receivedShareRestService) {
            return receivedShareRestService.getList();
          },
          documentSelected: function($stateParams, files) {
            if (_.isUndefined($stateParams.fileUuid)) {
              return null;
            }
            return _.find(files, function(doc) {
              return doc.uuid === $stateParams.fileUuid;
            });
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
          functionality: function($state, functionalities, user) {
            if (!functionalities.WORK_GROUP.enable && !user.canUpload) {
              $state.go('home');
            }
          },
          checkUrl: function($state, $stateParams, functionalities, lsAppConfig, user) {
            switch ($stateParams.from) {
              case lsAppConfig.mySpacePage:
                if (!user.canUpload) {
                  $state.go('documents.upload', {
                    from: lsAppConfig.workgroupPage
                  });
                  $stateParams.from = lsAppConfig.workgroupPage;
                }
                break;
              case lsAppConfig.workgroupPage:
                if (!functionalities.WORK_GROUP.enable) {
                  $state.go('documents.upload', {
                    from: lsAppConfig.mySpacePage
                  });
                  $stateParams.from = lsAppConfig.mySpacePage;
                }
                break;
              default:
                $state.go('documents.upload', {
                  from: lsAppConfig.mySpacePage
                });
                $stateParams.from = lsAppConfig.mySpacePage;
                break;
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
        abstract: true,
        url: '/sharedspace',
        template: '<div ui-view></div>',
        resolve: {
          functionality: function($state, functionalities) {
            if (!functionalities.WORK_GROUP.enable) {
              $state.go('home');
            }
          },
        }
      })
      .state('sharedspace.all', {
        url: '/list',
        templateUrl: 'modules/linshare.sharedSpace/views/workgroups.html',
        controller: 'SharedSpaceController as vm',
        resolve: {
          workgroups: function(workgroupRestService,
          /* jshint ignore:line */ functionalities) { //TODO: will be removed with update ui-router > 1.0
            return workgroupRestService.getList();
          }
        }
      })
      .state('sharedspace.workgroups', {
        abstract: true,
        url: '/workgroups',
        template: '<div ui-view></div>'
      })
      .state('sharedspace.workgroups.root', {
        url: '/:workgroupUuid/:workgroupName',
        templateUrl: 'modules/linshare.sharedSpace/views/workgroupNodesList.html',
        controller: 'WorkgroupNodesController as workgroupNodesVm',
        params: {
          uploadedFileUuid: null,
          parentUuid: null
        },
        resolve: {
          nodesList: function(workgroupNodesRestService, $stateParams,
          /* jshint ignore:line */ functionalities) { //TODO: will be removed with update ui-router > 1.0
            return workgroupNodesRestService.getList($stateParams.workgroupUuid);
          }
        }
      })
      .state('sharedspace.workgroups.folder', {
        url: '/:workgroupUuid/:workgroupName/:folderUuid/:folderName',
        templateUrl: 'modules/linshare.sharedSpace/views/workgroupNodesList.html',
        controller: 'WorkgroupNodesController as workgroupNodesVm',
        params: {
          uploadedFileUuid: null,
          parentUuid: null,
          folderUuid: null,
          folderName: null
        },
        resolve: {
          nodesList: function(workgroupNodesRestService, $stateParams,
          /* jshint ignore:line */functionalities) { //TODO: will be removed with update ui-router > 1.0
            return workgroupNodesRestService.getList($stateParams.workgroupUuid, $stateParams.folderUuid);
          }
        }
      })
      .state('administration', {
        parent: 'common',
        url: '/administration',
        template: '<div ui-view></div>'
      })
      .state('administration.contactslists', {
        abstract: true,
        url: '/contactslists',
        template: '<div ui-view></div>',
        resolve: {
          functionality: function($state, functionalities) {
            if (!functionalities.CONTACTS_LIST.enable) {
              $state.go('home');
            }
          }
        }
      })
      .state('administration.contactslists.list', {
        url: '/:from',
        params: {
          createNew: undefined
        },
        templateUrl: 'modules/linshare.contactsLists/views/contactsListsList.html',
        controller: 'contactsListsListController',
        controllerAs: 'contactsListsListVm',
        resolve: {
          checkUrl: function($state, $stateParams, lsAppConfig,
          /* jshint ignore:line */ functionality) { //TODO: will be removed with update ui-router > 1.0
            if ($stateParams.from.length === 0) {
              $stateParams.from = lsAppConfig.contactsListsMinePage;
            } else if ($stateParams.from !== lsAppConfig.contactsListsMinePage &&
                $stateParams.from !== lsAppConfig.contactsListsOthersPage) {
              return $state.go('administration.contactslists.list', {
                from: lsAppConfig.contactsListsMinePage
              });
            }
          },
          createNew: function($stateParams,
          /* jshint ignore:line */ functionality) { //TODO: will be removed with update ui-router > 1.0
            return _.isUndefined($stateParams.createNew) ? false : $stateParams.createNew;
          },
          contactsListsList: function($stateParams, lsAppConfig, contactsListsListRestService,
          /* jshint ignore:line */ functionality) { //TODO: will be removed with update ui-router > 1.0
            return contactsListsListRestService.getList($stateParams.from !== lsAppConfig.contactsListsOthersPage);
          }
        }
      })
      .state('administration.contactslists.list.contacts', {
        url: '/:contactsListUuid/:contactsListName/contacts',
        params: {
          addContacts: undefined
        },
        templateUrl: 'modules/linshare.contactsLists/views/contactsListsContacts.html',
        controller: 'contactsListsContactsController',
        controllerAs: 'contactsListsContactsVm',
        resolve: {
          addContacts: function($stateParams,
          /* jshint ignore:line */ functionality) { //TODO: will be removed with update ui-router > 1.0
            return _.isUndefined($stateParams.addContacts) ? false : $stateParams.addContacts;
          },
          contactsListsContacts: function(contactsListsContactsRestService, $stateParams,
          /* jshint ignore:line */ functionality) { //TODO: will be removed with update ui-router > 1.0
            return contactsListsContactsRestService.getList($stateParams.contactsListUuid);
          }
        }
      })
      .state('administration.guests', {
        url: '/adminguests',
        templateUrl: 'modules/linshare.guests/views/list.html',
        controller: 'LinshareGuestsController',
        controllerAs: 'guestVm',
        resolve: {
          functionality: function($state, functionalities) {
            if (_.isNil(functionalities.GUESTS)) {
              $state.go('home');
            } else {
              if (!functionalities.GUESTS.enable) {
                $state.go('home');
              }
            }
          },
          userType: function($state, lsAppConfig, user) {
            if (user.accountType === lsAppConfig.accountType.guest) {
              $state.go('home');
            }
          }
        }
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
        templateUrl: 'modules/linshare.audit/views/auditList.html',
        controller: 'AuditController',
        controllerAs: 'auditVm',
      })
      .state('audit.upload_request', {
        url: '/audit_upload_request',
        templateUrl: 'views/home/main.html'
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
      });

    /**
     * @name authRedirect
     * @desc Redirect the user on the home page if logged in or on the login page if not
     * @param {Object} $state - Setvice for router state
     * @param {Object} authenticationRestService - Service for authentication
     * @memberOf LinShareUiUserApp.routerConfiguration
     */
    function authRedirect($state, authenticationRestService) {
      authenticationRestService.checkAuthentication(false).then(function(data) {
        if (_.isUndefined(data.status)) {
          $state.go('home');
        } else {
          if (!$state.is('login')) {
            $state.go('login', {loginRequired: true});
          }
        }
      });
    }
  }
})();
