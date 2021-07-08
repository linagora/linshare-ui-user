/**
 * routerConfiguration Config
 * @namespace LinShareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .config(routerConfiguration);

  routerConfiguration.$inject = ['_', '$stateProvider', '$urlRouterProvider', 'lsAppConfig'];

  /**
   * @namespace routerConfiguration
   * @desc Router configuration for the LinShare APP
   * @memberOf LinShareUiUserApp
   */
  function routerConfiguration(_, $stateProvider, $urlRouterProvider, lsAppConfig) {
    $urlRouterProvider
      .when(/language\/.*/i, [
        '$window',
        '$state',
        'authenticationRestService',
        'languageService',
        'homePageService',
        function(
          $window,
          $state,
          authenticationRestService,
          languageService,
          homePageService
        ) {
          var language = $window.location.hash.split('/').pop();

          languageService.changeLocale(language);
          authRedirect($state, null, authenticationRestService, homePageService.getHomePage());
        }]).otherwise(function($injector) {
        $injector.invoke([
          '$state',
          'authenticationRestService',
          'homePageService',
          function(
            $state,
            authenticationRestService,
            homePageService
          ) {
            authRedirect($state, null, authenticationRestService, homePageService.getHomePage());
          }
        ]);
      });

    $stateProvider
      .state('common', {
        template: require('../views/common/common.html'),
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
      .state('login', {
        url: '/login?next',
        template: require('../views/common/loginForm.html'),
        controller: 'loginController',
        controllerAs: 'loginVm',
        params: {
          loginRequired: false
        },
        resolve: {
          authentication: function($state, $transition$, authenticationRestService, homePageService) {
            if (!$transition$.params().loginRequired) {
              $transition$.abort();
              authRedirect($state, $transition$, authenticationRestService, homePageService.getHomePage());
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
        template: require('../modules/linshare.document/views/documentsList.html'),
        controller: 'documentController',
        params: {
          uploadedFileUuid: null,
          shareFileUuids: null
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
        template: require('../modules/linshare.receivedShare/views/list.html'),
        controller: 'ReceivedController',
        resolve: {
          user: function(user) {
            return user;
          },
          files: function(receivedShareRestService) {
            return receivedShareRestService.getList();
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
        template: require('../modules/linshare.upload/views/lsUpload.html'),
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
        template: require('../modules/linshare.sharedSpace/views/sharedSpaces.html'),
        controller: 'SharedSpaceController as vm',
      })
      .state('sharedspace.drive', {
        url: '/drive/:driveUuid',
        template: require('../modules/linshare.sharedSpace/views/sharedSpaces.html'),
        controller: 'SharedSpaceController as vm',
      })
      .state('sharedspace.workgroups', {
        abstract: true,
        url: '/workgroups',
        template: '<div ui-view></div>'
      })
      .state('sharedspace.workgroups.root', {
        url: '/:workgroupUuid/:workgroupName',
        template: require('../modules/linshare.sharedSpace/views/workgroupNodesList.html'),
        controller: 'WorkgroupNodesController as workgroupNodesVm',
        params: {
          uploadedFileUuid: null,
          parentUuid: null,
          workgroupName: ''
        },
        resolve: {
          currentFolder: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.get(
              $transition$.params().workgroupUuid, $transition$.params().workgroupUuid, true)
              .catch(() => {
                $transition$.abort();
              });
          },
          nodesList: function(currentFolder, workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.getList($transition$.params().workgroupUuid)
              .catch(() => {
                $transition$.abort();
              });
          },
          workgroup: function(currentFolder, nodesList, $transition$, sharedSpaceRestService) {
            return sharedSpaceRestService.get($transition$.params().workgroupUuid, false, true).then(function(workgroup) {
              return workgroup;
            }).catch(() => {
              $transition$.abort();
            });
          },
          workgroupPermissions: function(workgroup, workgroupPermissionsService, $transition$) {
            return workgroupPermissionsService
              .getWorkgroupsPermissions([workgroup])
              .then(function(workgroupPermissions) {
                const permissions = workgroupPermissionsService.formatPermissions(workgroupPermissions);

                return permissions[Object.keys(permissions)[0]];
              })
              .catch(() => {
                $transition$.abort();
              });
          },
        }
      })
      .state('sharedspace.search', {
        url: '/search?sharedSpace&folder',
        template: require('../modules/linshare.sharedSpace/views/workgroupNodesSearch.html'),
        controller: 'workgroupNodesSearchController',
        controllerAs: 'workgroupSearchVm',
        params: {
          sharedSpace: null,
          folder: null,
          searchParams: null
        },
        resolve: {
          sharedSpace: ($stateParams, sharedSpaceRestService) => sharedSpaceRestService.get($stateParams.sharedSpace, false, true),
          folder: ($stateParams, workgroupNodesRestService) => workgroupNodesRestService.get(
            $stateParams.sharedSpace, $stateParams.folder, true),
          permissions: (sharedSpace, workgroupPermissionsService) => {
            const { getWorkgroupsPermissions,formatPermissions} = workgroupPermissionsService;

            return getWorkgroupsPermissions([sharedSpace])
              .then(formatPermissions)
              .then(formatted => formatted[Object.keys(formatted)[0]]);
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
        template: require('../modules/linshare.sharedSpace/views/workgroupNodesList.html'),
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
          redirect: function(currentFolder, $state, $stateParams, $transition$) {
            if(currentFolder.type === 'DOCUMENT') {
              $transition$.abort();

              return $state.go('sharedspace.workgroups.version', {
                workgroupUuid: $stateParams.workgroupUuid,
                workgroupName: $stateParams.workgroupName,
                fileUuid: $stateParams.folderUuid,
                fileName: $stateParams.folderName
              });
            }

            return;
          },
          nodesList: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.getList(
              $transition$.params().workgroupUuid, $transition$.params().folderUuid);
          },
          workgroup: function($transition$, sharedSpaceRestService) {
            return sharedSpaceRestService.get($transition$.params().workgroupUuid, false, true).then(function(workgroup) {
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

      .state('sharedspace.workgroups.version', {
        url: '/:workgroupUuid/:workgroupName/:fileUuid/:fileName',
        template: require('../modules/linshare.sharedSpace/views/workgroupVersionsList.html'),
        controller: 'WorkgroupVersionsController',
        controllerAs: 'workgroupVersionsVm',
        params: {
          uploadedFileUuid: null,
          parentUuid: null,
          workgroupName: '',
          fileUuid: null,
          fileName: ''
        },
        resolve: {
          isVersionEnable: function(functionalities, $state, $transition$) {
            if (!functionalities.WORK_GROUP__FILE_VERSIONING.enable) {
              $transition$.abort();
              $state.go('home');
            }
          },
          currentFolder: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.get(
              $transition$.params().workgroupUuid, $transition$.params().fileUuid, true);
          },
          nodesList: function(workgroupNodesRestService, $transition$) {
            return workgroupNodesRestService.getList(
              $transition$.params().workgroupUuid, $transition$.params().fileUuid);
          },
          workgroup: function($transition$, sharedSpaceRestService) {
            return sharedSpaceRestService.get($transition$.params().workgroupUuid, false, true).then(function(workgroup) {
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
        template: require('../modules/linshare.contactsLists/views/contactsListsList.html'),
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
        template: require('../modules/linshare.contactsLists/views/contactsListsContacts.html'),
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
        template: require('../modules/linshare.guests/views/list.html'),
        controller: 'LinshareGuestsController',
        controllerAs: 'guestVm',
        params: {
          email: null,
        },
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
          },
          withEmail: function($transition$) {
            return $transition$.params().email;
          }
        }
      })
      .state('administration.users', {
        url: '/users',
        template: require('../views/home/main.html')
      })
      .state('administration.groups', {
        url: '/sharedspace',
        template: require('../views/home/main.html')
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
        template: require('../modules/linshare.audit/views/auditList.html'),
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
        template: require('../modules/linshare.share/views/shares_detail.html'),
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
        template: require('../modules/linshare.safeDetails/views/safeDetailsList.html'),
        controller: 'SafeDetailsController',
        controllerAs: 'safeDetailsVm'
      });

    if (!lsAppConfig.hideHomeMenuLink) {
      $stateProvider
        .state('home', {
          parent: 'common',
          url: '/home',
          template: require('../views/home/home.html'),
          controller: 'HomeController'
        });
    }

    /**
     * @name authRedirect
     * @desc Redirect the user on the home page if logged in or on the login page if not
     * @param {Object} $state - Setvice for router state
     * @param {Object} authenticationRestService - Service for authentication
     * @memberOf LinShareUiUserApp.routerConfiguration
     */
    function authRedirect($state, $transition$, authenticationRestService, homePage) {
      authenticationRestService.checkAuthentication(true, true).then(function(data) {
        if (_.isUndefined(data.status)) {
          if ($transition$) {
            $transition$.abort();
          }
          $state.go(homePage || 'home');
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
