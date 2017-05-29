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
  UiUserMainController.$inject = ['_', '$http', '$log', '$q', '$rootScope', '$scope', '$state', '$timeout', '$window',
    'authenticationRestService', 'checkTableHeightService', 'flowUploadService', 'functionalityRestService',
    'LinshareUserService', 'lsAppConfig', 'MenuService', 'sharableDocumentService', 'ShareObjectService',
    'toastService', 'uploadRestService'
  ];

  function UiUserMainController(_, $http, $log, $q, $rootScope, $scope, $state, $timeout, $window,
    authenticationRestService, checkTableHeightService, flowUploadService, functionalityRestService,
    LinshareUserService, lsAppConfig, MenuService, sharableDocumentService, ShareObjectService,
    toastService, uploadRestService) {
    /* jshint validthis:true */
    var mainVm = this;

    const URL_HOME = 'home';
    const URL_LOGIN = 'login';

    //TODO: shall be moved to the directive controller of linshareSidebar directive
    var widthWindow = angular.element(window).width();

    $rootScope.isMobile = angular.element('html').hasClass('ismobile');
    $rootScope.mobileWidthBreakpoint = 768;
    $rootScope.sidebarLeftWidth = 268;
    $rootScope.sidebarRightWidth = 350;
    $scope.getUserQuotas = getUserQuotas;
    $scope.lsAppConfig = lsAppConfig;
    $scope.mySpacePage = lsAppConfig.mySpacePage;
    $scope.productVersion = 'dev';
    $scope.refFlowShares = {};
    $scope.setUserQuotas = setUserQuotas;
    $scope.shareArray = [];
    $scope.sizeHeight = $window.innerHeight - 50;
    $scope.userQuotas = {};
    $scope.workgroupPage = lsAppConfig.workgroupPage;

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
      MenuService.build();
      $scope.loggedUser = new LinshareUserService();
      mainVm.sidebar = new Sidebar();

      flowUploadService.initFlowUploadService();

      if ($scope.mactrl.sidebarToggle.left) {
        checkTableHeightService.checkAndSetNewWidth($scope.mactrl.sidebarToggle.left);
      }

      //Watcher for setting sidebar in mobile mode or desktop on resize
      if (!$rootScope.isMobile) {
        angular.element(window).resize(function() {
          $scope.mactrl.sidebarToggle.left = checkTableHeightService.checkAndSetNewWidth();
          checkTableHeightService.checkAndSetNewWidthSidebarRight();
        });
      }

      $scope.$watch(function() {
        return $window.innerWidth;
      }, function(newWidth) {
        $rootScope.isMobile = (newWidth <= $rootScope.mobileWidthBreakpoint);
        $scope.mactrl.sidebarToggle.left = checkTableHeightService.checkAndSetNewWidth();
        $timeout(function() {
          checkTableHeightService.checkAndSetNewWidthSidebarRight();
        }, 450);
      });

      //TODO: Watcher to manage globally the state of an uploaded file waiting for share
      $scope.$on('flow::fileSuccess', function fileSuccessAction(event, $flow, flowFile, $message) {
        $log.debug('UPLOAD SUCCESS', flowFile.name);
        flowFile.doingAsyncUpload = true;
        mainVm.flowUploadService.addUploadedFile(flowFile, $message).then(function(file) {
          toastService.success({
            key: 'UPLOAD_DONE',
            params: {
              fileName: file.name,
              singular: 'true'
            },
            plural: true
          });
          $scope.getUserQuotas();
          if (file._from === lsAppConfig.mySpacePage) {
            sharableDocumentService.sharableDocuments(file, $scope.shareArray, $scope.refFlowShares);
          }
          launchShare(file);
        }).catch(function(file) {
          launchShare(file);
        });
      });

      $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
        mainVm.flowUploadService.checkQuotas([flowFile], false, $scope.setUserQuotas);
      });

      $scope.$on('flow::fileRemoved', function fileRemoveAction(event, $flow, flowFile) {
        mainVm.removeShareDocument(flowFile);
      });

      $scope.$on('flow::fileError', function fileErrorAction(event, $flow, flowFile) {
        mainVm.removeShareDocument(flowFile);
        mainVm.flowUploadService.checkQuotas([flowFile], true, $scope.setUserQuotas);
      });

      $scope.$on('flow::uploadStart', function(event, $flow) {
        _.forEach($flow.files, function(flowFile) {
          if (!flowFile.quotaChecked) {
            mainVm.flowUploadService.checkQuotas([flowFile], false, $scope.setUserQuotas);
          }
        });
      });

      $rootScope.$on('$stateChangeStart', function(event, toState) {
        mainVm.sidebar.hide();
        $q.all([MenuService.getProperties(toState.name, false), MenuService.getProperties(toState.name, true)])
          .then(function(promises) {
            $scope.currentState = promises[0];
            $scope.linkActive = promises[1];
          });
      });

      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        $log.debug('$stateChangeError - ', error);
        if (error.status < 500 && error.status !== 401) {
          $state.go(URL_HOME);
        } else {
          $state.go(URL_LOGIN);
        }
      });

      $scope.$on('event:auth-loginConfirmed', function(event, data) {
        setVisualElement();

        authenticationRestService.version().then(function(data) {
          $scope.coreVersion = data.version;
        });

        MenuService.build();

        $log.debug('event:auth-loginConfirmed : toState', $scope.urlTogoAfterLogin);
        $scope.loggedUser.setUser(data);
        $scope.userLogged = data;

        getProductVersion();

        if (_.isUndefined($scope.urlTogoAfterLogin)) {
          $state.go(URL_HOME);
        } else {
          $state.go($scope.urlTogoAfterLogin, $scope.urlTogoAfterLoginParams);
        }
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
          $scope.isMobileMode = false;
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
          $scope.isMobileMode = true;
          angular.element('.collapsible-content').removeClass('set-width');
          angular.element('.collapsible-content').css('width', '100%');
          if (widthWindow >= 900) {
            angular.element('.collapsible-actions-toolbar').removeClass('set-width');
            angular.element('.collapsible-actions-toolbar').css('width', '100%');
          }
        }
      });

      $scope.$watch('mactrl.sidebarToggle.left', function() {
        $window.localStorage.setItem('sidebarToggleLeft', $scope.mactrl.sidebarToggle.left);
      });

      localStorage.setItem('ma-layout-status', 0);

      setVisualElement();

      /**
       * @name set Visual Element
       * @desc Set visual element for user interaction
       * @memberOf linshareUiUserApp.UiUserMainController
       */
      function setVisualElement() {
        $q.all([authenticationRestService.getCurrentUser(), functionalityRestService.getAll()])
          .then(function(promises) {
            var
              user = promises[0],
              functionalities = promises[1];

            mainVm.showTransfert = (user.canUpload || functionalities.WORK_GROUP.enable);
            $scope.loggedUser.setUser(user);
            user.firstLetter = user.firstName.charAt(0);
            $scope.userLogged = user;
            getUserQuotas();
          });
      }

    }

    /**
     * @name getProductVersion
     * @desc Get LinShare product version
     * @memberOf linshareUiUserApp
     */
    function getProductVersion() {
      $http.get('/about.json').success(function(data) {
        $scope.productVersion = data.version;
      });
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
    function setUserQuotas(quotas) {
      $scope.userQuotas.used = quotas.usedSpace;
      $scope.userQuotas.total = quotas.quota;
      $scope.userQuotas.remaining = $scope.userQuotas.total - $scope.userQuotas.used;
      $scope.userQuotas.percent = Math.floor(($scope.userQuotas.used / $scope.userQuotas.total) * 100);
      $scope.userQuotas.maxFileSize = quotas.maxFileSize;

      if ($scope.userQuotas.percent >= 85 && $scope.userQuotas.percent < 95) {
        $scope.userQuotas.progressBarColor = 'quotas-progress-bar-orange';
      } else if ($scope.userQuotas.percent >= 95) {
        $scope.userQuotas.progressBarColor = 'quotas-progress-bar-red';
      } else {
        $scope.userQuotas.progressBarColor = 'quotas-progress-bar-green';
      }
    }

    /**
     * @name Sidebar
     * @desc Right sidebar object
     * @memberOf linshareUiUserApp
     */
    function Sidebar() {
      var sidebar = {
        visible: false,
        content: '',
        data: {},
        setContent: setContent,
        getContent: getContent,
        setData: setData,
        getData: getData,
        addData: addData,
        removeData: removeData,
        toggle: toggle,
        show: show,
        hide: hide,
        isVisible: isVisible
      };

      return sidebar;

      ////////////

      function setContent(content) {
        sidebar.content = content;
      }

      function getContent() {
        return sidebar.content;
      }

      function setData(data) {
        sidebar.data = data;
      }

      function getData() {
        return sidebar.data;
      }

      function addData(key, value) {
        sidebar.data[key] = value;
      }

      function removeData(key) {
        delete sidebar.data[key];
      }

      function toggle() {
        sidebar.visible = !sidebar.toggle;
      }

      function show() {
        sidebar.visible = true;
      }

      function hide(form, obj) {
        sidebar.visible = false;
        sidebar.setContent(null);
        if (obj && !_.isUndefined(obj.reset)) {
          obj.reset();
        }
      }

      function isVisible() {
        return sidebar.visible;
      }
    }
  }
})();
