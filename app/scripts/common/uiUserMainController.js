/**
 * UiUserMainController Controller
 * @namespace linshareUiUserApp
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('UiUserMainController', UiUserMainController);

  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false */
  UiUserMainController.$inject = [
    '_',
    '$log',
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$timeout',
    '$transitions',
    '$translate',
    '$window',
    'authenticationRestService',
    'checkTableHeightService',
    'deviceDetector',
    'flowUploadService',
    'functionalityRestService',
    'LinshareUserService',
    'lsAppConfig',
    'MenuService',
    'quotaService',
    'sharableDocumentService',
    'ShareObjectService',
    'sidebarService',
    'toastService',
    'uploadRestService',
    'homePageService'
  ];

  function UiUserMainController(
    _,
    $log,
    $q,
    $rootScope,
    $scope,
    $state,
    $timeout,
    $transitions,
    $translate,
    $window,
    authenticationRestService,
    checkTableHeightService,
    deviceDetector,
    flowUploadService,
    functionalityRestService,
    LinshareUserService,
    lsAppConfig,
    MenuService,
    quotaService,
    sharableDocumentService,
    ShareObjectService,
    sidebarService,
    toastService,
    uploadRestService,
    homePageService
  ) {
    /* jshint validthis:true */
    var mainVm = this;

    const URL_HOME = homePageService.getHomePage();
    const URL_LOGIN = 'login';
    const TYPE_REVISION = 'DOCUMENT_REVISION';

    //TODO: shall be moved to the directive controller of linshareSidebar directive
    var widthWindow = angular.element(window).width();

    //TODO Mobile Device Detector
    $rootScope.isMobile = deviceDetector.isMobile();
    $rootScope.isTablet = deviceDetector.isTablet();
    $rootScope.isDesktop = deviceDetector.isDesktop();
    $rootScope.mobileWidthBreakpoint = 768;
    $rootScope.sidebarLeftWidth = 268;
    $rootScope.sidebarRightWidth = 350;
    $scope.getUserQuotas = getUserQuotas;
    $scope.lsAppConfig = lsAppConfig;
    $scope.mySpacePage = lsAppConfig.mySpacePage;
    $scope.refFlowShares = {};
    $scope.setUserQuotas = setUserQuotas;
    $scope.shareArray = [];
    $scope.sizeHeight = $window.innerHeight - 50;
    $scope.userQuotas = {};
    $scope.workgroupPage = lsAppConfig.workgroupPage;

    mainVm.applicationLogoSmall = lsAppConfig.applicationLogo.small;
    mainVm.applicationLogoLarge = lsAppConfig.applicationLogo.large;
    mainVm.loginBackground = lsAppConfig.loginBackground;

    mainVm.flowUploadService = flowUploadService;
    mainVm.removeShareDocument = removeShareDocument;
    mainVm.resizeDragNDropCtn = resizeDragNDropCtn;

    activate();

    ////////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshareUiUserApp
     */
    function activate() {
      var notifyTimeoutReference;

      $translate('ACTION.PREVENT_EXIT').then(function(message) {
        $scope.preventExitMessage = message;
      });

      $scope.loggedUser = new LinshareUserService();
      mainVm.sidebar = sidebarService;

      flowUploadService.initFlowUploadService();

      if ($scope.mainVm.sidebarToggle) {
        checkTableHeightService.checkAndSetNewWidth($scope.mainVm.sidebarToggle);
      }

      //Watcher for setting sidebar in mobile mode or desktop on resize
      if (!$rootScope.isMobile  || checkTableHeightService.checkWidthIsBiggerThanMobile()) {
        angular.element(window).resize(function() {
          $scope.mainVm.sidebarToggle = checkTableHeightService.checkAndSetNewWidth();
          checkTableHeightService.checkAndSetNewWidthSidebarRight();
        });
      }

      $scope.$watch(function() {
        return $window.innerWidth;
      }, function() {
        $rootScope.isMobile = deviceDetector.isMobile();
        $scope.mainVm.sidebarToggle = checkTableHeightService.checkAndSetNewWidth();
        $timeout(function() {
          checkTableHeightService.checkAndSetNewWidthSidebarRight();
        }, 450);
      });

      //TODO: Watcher to manage globally the state of an uploaded file waiting for share
      $scope.$on('flow::fileSuccess', function fileSuccessAction(event, $flow, flowFile, $message) {
        preventExit($flow.progress() !== 1);
        $log.debug('UPLOAD SUCCESS', flowFile.name);
        flowFile.doingAsyncUpload = true;
        $flow.opts.stack.push(flowFile);
        mainVm.flowUploadService.addUploadedFile(flowFile, $message).then(function(file) {
          notify(file);
          $scope.getUserQuotas();
          if (file._from === lsAppConfig.mySpacePage) {
            sharableDocumentService.sharableDocuments(file, $scope.shareArray, $scope.refFlowShares);
          }
          launchShare(file);
        }).catch(function(file) {
          launchShare(file);
        });

        /**
         * @name notify
         * @desc Notification of upload done by Toast message
         * @param {Object} file - A successfully uploaded flowFile object
         * @memberOf linshare.uiUserApp.activate.fileSuccessAction
         */
        function notify(file) {
          if (notifyTimeoutReference) {
            $timeout.cancel(notifyTimeoutReference);
          }

          notifyTimeoutReference = $timeout(function() {
            doNotification(file);
          }, 1000);
        }
      });

      /**
     * @name doNotification
     * @desc Notify user about upload success when this function is not re-called in a second
     * @param {Object} file - A successfully uploaded flowFile object
     * @returns {Void}
     * @memberOf linshare.uiUserApp.activate.fileSuccessAction
     */
      function doNotification(file) {
        notifyTimeoutReference = undefined;
        var stack = file.flowObj.opts.stack;

        if (_.find(stack, file)) {
          var files = _.remove(stack, function(flowFile) {
            return flowFile.linshareDocument;
          });

          var toastMsg;

          if (file.linshareDocument.type === TYPE_REVISION && files.length === 1) {
            toastMsg = {key: 'UPLOAD_VERSION_DONE', pluralization: true};
            if (file._from === lsAppConfig.workgroupPage) {
              toastMsg.params = {
                fileName: file.name,
                addFilename: 'true'
              };
            }
          } else {
            toastMsg = {key: 'UPLOAD_DONE', pluralization: true};
            if (files.length === 1) {
              toastMsg.params = {
                fileName: file.name,
                singular: 'true'
              };
            }
          }
          toastService.success(toastMsg);
        }
      }

      $scope.$on('flow::fileRemoved', function fileRemoveAction(event, $flow, flowFile) {
        preventExit($flow.progress() !== 1);
        mainVm.removeShareDocument(flowFile);
      });

      $scope.$on('flow::fileError', function fileErrorAction(event, $flow, flowFile, message, flowChunk) {
        preventExit($flow.progress() !== 1);
        mainVm.flowUploadService.errorHandler(flowFile, flowChunk);
        if (!flowFile.canBeRetried) {
          mainVm.removeShareDocument(flowFile);
        }
        mainVm.flowUploadService.checkQuotas([flowFile], true, $scope.setUserQuotas);
      });

      $scope.$on('flow::uploadStart', function(event, $flow) {
        preventExit($flow.progress() !== 1);
        _.forEach($flow.files, function(flowFile) {
          if (!flowFile.quotaChecked) {
            mainVm.flowUploadService.checkQuotas([flowFile], false, $scope.setUserQuotas);
          }
        });
      });

      $transitions.onStart({}, function(trans) {
        var
          toState = trans.to(),
          toParams = trans.params(),
          fromState = trans.from(),
          fromParams = trans.params('from');

        mainVm.sidebar.hide();

        $rootScope.toState = toState.name;
        $rootScope.toParams = toParams;
        $rootScope.fromState = fromState.name;
        $rootScope.fromParams = fromParams;
      });

      $transitions.onSuccess({}, function() {
        // always scroll to top upon reload
        window.scrollTo(0,0);

        $q.all([
          MenuService.getProperties($rootScope.toState, false, $rootScope.toParams),
          MenuService.getProperties($rootScope.toState, true, $rootScope.toParams)
        ]).then(function(promises) {
          $scope.currentState = promises[0];
          $scope.linkActive = promises[1];
        });
      });

      $transitions.onError({}, function(trans) {
        var error = trans.error();

        if (error.detail) {
          trans.abort();
          if (error.detail.status >= 500 || error.detail.status === 401) {
            $state.go(URL_LOGIN);
          } else {
            $state.go(URL_HOME);
          }
        }
      });


      // TODO: please translate into a directive
      // disables scale for mobile phones
      $(document).on('touchmove', function(event) {
        event = _.defaultTo(event.originalEvent, event);
        if (event.scale !== 1) {
          event.preventDefault();
        }
      });
      // scroll to input upon focus
      angular.element('input textarea').on('focus', function() {
        angular.element('body').scrollTop = this.offset().top + 70;
      });

      $scope.$on('event:auth-loginConfirmed', function(event, data) {
        setVisualElement();

        MenuService.build();

        $log.debug('event:auth-loginConfirmed : toState', $scope.urlTogoAfterLogin);
        $scope.loggedUser.setUser(data);
        $scope.userLogged = data;

        flowUploadService.initFlowUploadService();

        if (_.isUndefined($scope.urlTogoAfterLogin)) {
          return $state.go(URL_HOME);
        }

        $state.go($scope.urlTogoAfterLogin, $scope.urlTogoAfterLoginParams);
      });

      $scope.$on('event:auth-loginRequired', function() {
        $log.debug('event:auth-loginRequired : toState', $rootScope.toState);
        $scope.urlTogoAfterLogin = $rootScope.toState;
        $scope.urlTogoAfterLoginParams = $rootScope.toParams;
        $scope.loggedUser.getUser();
        if ($scope.urlTogoAfterLogin === URL_LOGIN) {
          $scope.urlTogoAfterLogin = URL_HOME;
          $state.go(URL_LOGIN, {loginRequired: true});
        } else {
          $state.go(URL_LOGIN, {
            next: $scope.urlTogoAfterLogin,
            loginRequired: true
          });
        }
      });

      $scope.$watch(function() {
        return $window.innerHeight;
      }, function() {
        $scope.sizeHeight = $window.innerHeight - 50;
      });

      $scope.$watch('mainVm.sidebar.isVisible()', function(n) {
        checkTableHeightService.checkAndSetNewWidthSidebarRight();
        if (widthWindow > $rootScope.mobileWidthBreakpoint) {
          if (n === true) {
            angular.element('.collapsible-content').addClass('set-width');
            if (widthWindow >= 900) {
              angular.element('.collapsible-actions-toolbar').addClass('set-width');
            }
          } else {
            angular.element('#file-list-table td .ctn-name-actions').attr('style', '');
            angular.element('.collapsible-content').removeClass('set-width');
            angular.element('.collapsible-content').css('width', '100%');
            if (widthWindow >= 900) {
              angular.element('.collapsible-actions-toolbar').removeClass('set-width');
              angular.element('.collapsible-actions-toolbar').css('width', '100%');
            }
          }
        } else {
          angular.element('.collapsible-content').removeClass('set-width');
          angular.element('.collapsible-content').css('width', '100%');
          if (widthWindow >= 900) {
            angular.element('.collapsible-actions-toolbar').removeClass('set-width');
            angular.element('.collapsible-actions-toolbar').css('width', '100%');
          }
        }
      });

      setVisualElement();

      MenuService.build();

      /**
       * @name set Visual Element
       * @desc Set visual element for user interaction
       * @memberOf linshareUiUserApp.UiUserMainController
       */
      function setVisualElement() {
        $q.all([
          authenticationRestService.getCurrentUser(),
          functionalityRestService.getAll()
        ])
          .then(([user, functionalities]) => {
            mainVm.showTransfert = (user.canUpload || functionalities.WORK_GROUP.enable);
            mainVm.show2FA = functionalities.SECOND_FACTOR_AUTHENTICATION.enable;
            mainVm.showTokenManagement = functionalities.JWT_PERMANENT_TOKEN.enable && functionalities.JWT_PERMANENT_TOKEN__USER_MANAGEMENT.enable;

            user.firstLetter = user.firstName.charAt(0);
            $scope.loggedUser.setUser(user);
            $scope.userLogged = user;
            getUserQuotas();
          })
          .catch(error => $log.debug(error));
      }
    }

    /**
     * @name preventExit
     * @desc Set onbeforeunload function to prevent user to exist
     * @param {Boolean} activate - Determine if user shall be prevented or not by setting onbeforeunload function
     * @memberOf linshareUiUserApp
     */
    function preventExit(activate) {
      if (activate) {
        window.onbeforeunload = function() {
          return $scope.preventExitMessage;
        };

        return;
      }

      window.onbeforeunload = undefined;
    }

    /**
     * @name getUserQuotas
     * @desc Get user's quotas
     * @memberOf linshareUiUserApp
     */
    function getUserQuotas() {
      uploadRestService.getQuota($scope.userLogged.quotaUuid).then(function(quotas) {
        $scope.setUserQuotas(quotas.plain());
      });
    }

    /**
     * @name launchShare
     * @desc Execute share process
     * @param {Object} flowFile - File uploaded
     * @memberOf linshareUiUserApp
     */
    function launchShare(flowFile) {
      if (flowFile._from === lsAppConfig.mySpacePage) {
        sharableDocumentService.sharableDocuments(flowFile, $scope.shareArray, $scope.refFlowShares);
      }
    }

    /**
     * @name resizeDragNDropCtn
     * @desc Detect window's width and adapt dragndrop's container width
     * @memberOf linshareUiUserApp
     */
    function resizeDragNDropCtn(attr) {
      checkTableHeightService.checkAndSetNewWidth(attr);
    }

    /**
     * @name removeShareDocument
     * @desc Delete document being canceled in the share object waiting and remove or launch the share if necessary
     * @param {String} flowFile - A flowFile Object
     * @memberOf linshareUiUserApp
     */
    function removeShareDocument(flowFile) {
      var
        shareArray = $scope.shareArray,
        shareObject =
        _.find(shareArray, function(element) {
          _.remove(element.documents, _.isUndefined);

          return _.find(element.documents, function(doc) {
            return doc.uniqueIdentifier === flowFile.uniqueIdentifier;
          });
        });

      if (!_.isUndefined(shareObject)) {
        _.remove(shareObject.documents, _.isUndefined);

        var documentObject = _.find(shareObject.documents, function(doc) {
          return doc.uniqueIdentifier === flowFile.uniqueIdentifier;
        });

        _.remove(shareObject.documents, documentObject);
        _.remove(shareObject.waitingUploadIdentifiers, function(id) {
          return id === flowFile.uniqueIdentifier;
        });

        if (shareObject.documents.length === 0 || flowFile.error) {
          _.remove(shareArray, shareObject);
        } else {
          var documentInUpload = _.find(shareObject.documents, function(doc) {
            return doc.uniqueIdentifier;
          });

          if (_.isUndefined(documentInUpload)) {
            new ShareObjectService(shareObject).share();
          }
        }
      }
    }

    /**
     * @name setUserQuotas
     * @desc Set user's quotas for left sidebar details in bottom
     * @param {Object} quotas - Quotas details getted from server
     * @memberOf linshareUiUserApp
     */
    function setUserQuotas(quotaData) {
      var quotaBuilt = quotaService.buildQuota(quotaData);

      $scope.userQuotas = quotaBuilt;
    }
  }
})();
