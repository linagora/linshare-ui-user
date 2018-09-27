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
    $urlRouterProvider
      .when(/language\/.*/i, [
        '$window',
        '$state',
        'authenticationRestService',
        'languageService',
        function(
          $window,
          $state,
          authenticationRestService,
          languageService
        ) {
          var language = $window.location.hash.split('/').pop();

          languageService.changeLocale(language);
          authRedirect($state, null, authenticationRestService);
        }]).otherwise(function($injector) {
          $injector.invoke([
            '$state',
            'authenticationRestService',
            function(
              $state,
              authenticationRestService
            ) {
              authRedirect($state, null, authenticationRestService);
            }
          ]);
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
        controller: 'HomeController'
      })
      .state('login', {
        url: '/login?next',
        templateUrl: 'views/common/loginForm.html',
        controller: 'loginController',
        controllerAs: 'loginVm',
        params: {
          loginRequired: false
        },
        resolve: {
          authentication: function($state, $transition$, authenticationRestService) {
           if (!$transition$.params().loginRequired) {
           $transition$.abort();
            authRedirect($state, $transition$, authenticationRestService);
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
          functionality: function($state, $transition$, user) {
            if (!user.canUpload) {
              $transition$.abort();
              $state.go('home');
            }
          },
          documentsList: function(LinshareDocumentRestService) {
            return LinshareDocumentRestService.getList();
          }
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
          documentsToIsolate: function($transition$, files) {
            var documentsToFind = $transition$.params().fileUuid;

            if (_.isUndefined(documentsToFind)) {
              return null;
            }

            return _.filter(files, function(doc) {
              return _.includes(documentsToFind, doc.uuid);
            });
          }
        }
      })
      .state('documents.upload', {
        url: '/upload/:from',
        params: {
          idUpload: null,
          openSidebar: null,
          from: ''
        },
        templateUrl: 'modules/linshare.upload/views/lsUpload.html',
        controller: 'uploadQueueController',
        controllerAs: 'uploadQueueVm',
        resolve: {
          functionality: function($state, $transition$, functionalities, user) {
            if (!functionalities.WORK_GROUP.enable && !user.canUpload) {
              $transition$.abort();
              $state.go('home');
            }
          },
          checkUrl: function($state, $transition$, functionalities, lsAppConfig, user) {
            switch ($transition$.params().from) {
              case lsAppConfig.mySpacePage:
                if (!user.canUpload) {
                  $transition$.abort();
                  if (!functionalities.WORK_GROUP.enable) {
                    $state.go('home');
                  } else {
                    $state.go('documents.upload', {from: lsAppConfig.workgroupPage});
                  }
                }
                break;
              case lsAppConfig.workgroupPage:
                if (!functionalities.WORK_GROUP.enable) {
                  $transition$.abort();
                  if (!user.canUpload) {
                    $state.go('home');
                  } else {
                    $state.go('documents.upload', {from: lsAppConfig.mySpacePage});
                  }
                }
                break;
              default:
                $transition$.abort();
                $state.go('documents.upload', {from: lsAppConfig.mySpacePage});
                break;
            }
          }
        }
      })
      .state('sharedspace', {
        parent: 'common',
        abstract: true,
        url: '/sharedspace',
        template: '<div ui-view></div>',
        resolve: {
          functionality: function($state, $transition$, functionalities) {
            if (!functionalities.WORK_GROUP.enable) {
              $transition$.abort();
              $state.go('home');
            }
          }
        }
      })
      .state('sharedspace.all', {
        url: '/list',
        templateUrl: 'modules/linshare.sharedSpace/views/workgroups.html',
        controller: 'SharedSpaceController as vm',
        resolve: {
          workgroups: function(workgroupRestService) {
            return workgroupRestService.getList();
          },
          workgroupsPermissions: function(workgroups, workgroupPermissionsService) {
            return workgroupPermissionsService
              .getWorkgroupsPermissions(workgroups)
              .then(function(workgroupsPermissions) {
                return workgroupPermissionsService.formatPermissions(workgroupsPermissions);
              });
          },
          workgroupsRoles: function(workgroups, workgroupRolesService) {
            return workgroupRolesService
              .getWorkgroupsRoles(workgroups)
              .then(function(workgroupsRoles) {
                return workgroupRolesService.formatRoles(workgroupsRoles);
              });
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
          parentUuid: null,
          workgroupName: ''
        },
        resolve: {
          currentFolder: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.get(
              $transition$.params().workgroupUuid, $transition$.params().workgroupUuid, true);
          },
          nodesList: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.getList($transition$.params().workgroupUuid);
          },
          workgroup: function($transition$, workgroupRestService) {
            return workgroupRestService.get($transition$.params().workgroupUuid, false).then(function(workgroup) {
              return workgroup;
            });
          },
          workgroupPermissions: function(workgroup, workgroupPermissionsService) {
            return workgroupPermissionsService
              .getWorkgroupsPermissions([workgroup])
              .then(function(workgroupPermissions) {
                const permissions = workgroupPermissionsService.formatPermissions(workgroupPermissions);

                return permissions[Object.keys(permissions)[0]];
              });
          },
          workgroupRole: function(workgroup, workgroupRolesService) {
            return workgroupRolesService
              .getWorkgroupsRoles([workgroup])
              .then(function(workgroupsRoles) {
                const roles = workgroupRolesService.formatRoles(workgroupsRoles);

                return roles[Object.keys(roles)[0]];
              });
          }
        }
      })
      .state('sharedspace.workgroups.root_redirect', {
        url: '/:workgroupUuid',
        resolve: {
          redirect: function($state, $stateParams) {
            return $state.go('sharedspace.workgroups.root', {workgroupUuid: $stateParams.workgroupUuid});
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
          workgroupName: '',
          folderName: ''
        },
        resolve: {
          currentFolder: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.get(
              $transition$.params().workgroupUuid, $transition$.params().folderUuid, true);
          },
          nodesList: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.getList(
              $transition$.params().workgroupUuid, $transition$.params().folderUuid);
          },
          workgroup: function($transition$, workgroupRestService) {
            return workgroupRestService.get($transition$.params().workgroupUuid, false).then(function(workgroup) {
              return workgroup;
            });
          },
          workgroupPermissions: function(workgroup, workgroupPermissionsService) {
            return workgroupPermissionsService
              .getWorkgroupsPermissions([workgroup])
              .then(function(workgroupPermissions) {
                const permissions = workgroupPermissionsService.formatPermissions(workgroupPermissions);

                return permissions[Object.keys(permissions)[0]];
              });
          },
          workgroupRole: function(workgroup, workgroupRolesService) {
            return workgroupRolesService
              .getWorkgroupsRoles([workgroup])
              .then(function(workgroupsRoles) {
                const roles = workgroupRolesService.formatRoles(workgroupsRoles);

                return roles[Object.keys(roles)[0]];
              });
          }
        }
      })
      .state('sharedspace.workgroups.folder_redirect', {
        url: '/:workgroupUuid/:workgroupName/:folderUuid',
        resolve: {
          redirect: function($state, $stateParams) {
            return $state.go('sharedspace.workgroups.folder', {
              workgroupUuid: $stateParams.workgroupUuid,
              workgroupName: $stateParams.workgroupName,
              folderUuid: $stateParams.folderUuid
            });
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
          functionality: function($state, $transition$, functionalities) {
            if (!functionalities.CONTACTS_LIST.enable) {
              $transition$.abort();
              $state.go('home');
            }
          }
        }
      })
      .state('administration.contactslists.list', {
        url: '/:from',
        params: {
          createNew: false,
          from: ''
        },
        templateUrl: 'modules/linshare.contactsLists/views/contactsListsList.html',
        controller: 'contactsListsListController',
        controllerAs: 'contactsListsListVm',
        resolve: {
          contactsListsList: function($transition$, lsAppConfig, contactsListsListRestService) {
            return contactsListsListRestService.getList(
              $transition$.params().from !== lsAppConfig.contactsListsOthersPage);
          }
        }
      })
      .state('administration.contactslists.list.contacts', {
        url: '/:contactsListUuid/:contactsListName/contacts',
        params: {
          addContacts: false
        },
        templateUrl: 'modules/linshare.contactsLists/views/contactsListsContacts.html',
        controller: 'contactsListsContactsController',
        controllerAs: 'contactsListsContactsVm',
        resolve: {
          contactsListsContacts: function(contactsListsContactsRestService, $transition$) {
            return contactsListsContactsRestService.getList($transition$.params().contactsListUuid);
          }
        }
      })
      .state('administration.guests', {
        url: '/adminguests',
        templateUrl: 'modules/linshare.guests/views/list.html',
        controller: 'LinshareGuestsController',
        controllerAs: 'guestVm',
        resolve: {
          functionality: function($state, $transition$, functionalities) {
            if (_.isNil(functionalities.GUESTS)) {
              $transition$.abort();
              $state.go('home');
            } else {
              if (!functionalities.GUESTS.enable) {
              $transition$.abort();
                $state.go('home');
              }
            }
          },
          userType: function($state, $transition$, lsAppConfig, user) {
            if (user.accountType === lsAppConfig.accountType.guest) {
              $transition$.abort();
              $state.go('home');
            }
          }
        }
      })
      .state('administration.users', {
        url: '/users',
        templateUrl: 'views/home/main.html'
      })
      .state('administration.groups', {
        url: '/sharedspace',
        templateUrl: 'views/home/main.html'
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
        controllerAs: 'auditVm'
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
          $transitions$: function($transition$) {
            return $transition$;
          },
          previousState: function($state) {
            var currentStateData = {
              Name: $state.current.name,
              Params: $state.params
            };
            return currentStateData;
          },
          shareIndex: function($transition$) {
            return $transition$.params().id;
          }
        }
      })
      .state('safe_details', {
        parent: 'common',
        url: '/safe',
        template: '<div ui-view></div>'
      })
      .state('safe_details.global', {
        url: '/safe_details',
        templateUrl: 'modules/linshare.safeDetails/views/safeDetailsList.html',
        controller: 'SafeDetailsController',
        controllerAs: 'safeDetailsVm'
      });

    /**
     * @name authRedirect
     * @desc Redirect the user on the home page if logged in or on the login page if not
     * @param {Object} $state - Setvice for router state
     * @param {Object} authenticationRestService - Service for authentication
     * @memberOf LinShareUiUserApp.routerConfiguration
     */
    function authRedirect($state, $transition$, authenticationRestService) {
      authenticationRestService.checkAuthentication(true, true).then(function(data) {
        if (_.isUndefined(data.status)) {
          if ($transition$) {
            $transition$.abort();
          }
          $state.go('home');
        } else {
          if (!$state.is('login')) {
            if ($transition$) {
              $transition$.abort();
            }
            $state.go('login', {loginRequired: true});
          }
        }
      });
    }
  }
})();
