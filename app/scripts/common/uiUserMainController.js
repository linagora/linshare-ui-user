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

  UiUserMainController.$inject = ['$http', '$log', '$rootScope', '$scope', '$state', '$timeout', '$window',
    'authenticationRestService', 'checkTableHeightService', 'flowUploadService', 'LinshareUserService', 'lsAppConfig',
    'MenuService', 'sharableDocumentService', 'ShareObjectService'];

  function UiUserMainController($http, $log, $rootScope, $scope, $state, $timeout, $window, authenticationRestService,
                                checkTableHeightService, flowUploadService, LinshareUserService, lsAppConfig,
                                MenuService, sharableDocumentService, ShareObjectService) {
    /* jshint validthis:true */
    var mainVm = this;

    const URL_HOME = 'home';
    const URL_LOGIN = 'login';

    //TODO: shall be moved to the directive controller of linshareSidebar directive
    var widthWindow = angular.element(window).width();

    $rootScope.mobileWidthBreakpoint = 768;
    $rootScope.sidebarLeftWidth = 268;
    $rootScope.sidebarRightWidth = 350;
    $scope.mySpacePage = lsAppConfig.mySpacePage;
    $scope.productVersion = 'dev';
    $scope.refFlowShares = {};
    $scope.share_array = [];
    $scope.sizeHeight = $window.innerHeight - 50;
    $scope.workgroupPage = lsAppConfig.workgroupPage;

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
      $scope.loggedUser = new LinshareUserService();
      mainVm.sidebar = new Sidebar();

      if ($scope.mactrl.sidebarToggle.left) {
        checkTableHeightService.checkAndSetNewWidth($scope.mactrl.sidebarToggle.left);
      }

      //Watcher for setting sidebar in mobile mode or desktop on resize
      angular.element(window).resize(function() {
        $scope.mactrl.sidebarToggle.left = checkTableHeightService.checkAndSetNewWidth();
        checkTableHeightService.checkAndSetNewWidthSidebarRight();
      });
      $scope.$watch(function() {
        return $window.innerWidth;
      }, function() {
        $scope.mactrl.sidebarToggle.left = checkTableHeightService.checkAndSetNewWidth();
        $timeout(function() {
          checkTableHeightService.checkAndSetNewWidthSidebarRight();
        }, 450);
      });

      //TODO: Watcher to manage globally the state of an uploaded file waiting for share
      $scope.$on('flow::fileSuccess', function fileSuccessAction(event, $flow, flowFile, $message) {
        $log.debug('event flow::fileSuccess fired');
        if (flowFile._from === lsAppConfig.mySpacePage) {
          var uploadedElement = flowUploadService.addUploadedFile(flowFile, $message);
          sharableDocumentService.sharableDocuments(uploadedElement, $scope.share_array, $scope.refFlowShares);
        }
      });

      $scope.$on('flow::fileRemoved', function fileRemoveAction(event, $flow, flowFile) {
        mainVm.removeShareDocument(flowFile);
      });

      $scope.$on('flow::fileError', function fileErrorAction(event, $flow, flowFile) {
        mainVm.removeShareDocument(flowFile);
      });

      $rootScope.$on('$stateChangeStart', function(event, toState) {
        mainVm.sidebar.hide();
        $scope.currentState = MenuService.getProperties(toState.name);
        $scope.linkActive = MenuService.getSectionName(toState.name);
      });

      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        $log.debug('$stateChangeError - ', error);
        $state.go(URL_HOME);
      });

      $scope.$on('event:auth-loginConfirmed', function(event, data) {
        authenticationRestService.version().then(function(data) {
          $scope.coreVersion = data.version;
        });
        getProductVersion();

        $log.debug('event:auth-loginConfirmed : toState', $scope.urlTogoAfterLogin);
        $scope.loggedUser.setUser(data);
        $state.go($scope.urlTogoAfterLogin, $scope.urlTogoAfterLoginParams);
      });

      $scope.$on('event:auth-loginRequired', function() {
        $log.debug('event:auth-loginRequired : toState', $rootScope.toState);
        $scope.urlTogoAfterLogin = $rootScope.toState;
        $scope.urlTogoAfterLoginParams = $rootScope.toParams;
        $scope.loggedUser.getUser();
        if ($scope.urlTogoAfterLogin === URL_LOGIN) {
          $scope.urlTogoAfterLogin = URL_HOME;
          $state.go(URL_LOGIN);
        } else {
          $state.go(URL_LOGIN, {
            next: $scope.urlTogoAfterLogin
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

      $scope.$watch('mactrl.sidebarToggle.left', function() {
        $window.localStorage.setItem('sidebarToggleLeft', $scope.mactrl.sidebarToggle.left);
      });

      authenticationRestService.getCurrentUser().then(function(user) {
        $scope.loggedUser.setUser(user);
        user.firstLetter = user.firstName.charAt(0);
        $scope.userLogged = user;
      });

      authenticationRestService.version().then(function(data) {
        $scope.coreVersion = data.version;
      });

      localStorage.setItem('ma-layout-status', 0);
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
        share_array = $scope.share_array,
        shareObject =
          _.find(share_array, function(element) {
            return _.find(element.documents, function(doc) {
              return doc.flowId === flowFile.uniqueIdentifier;
            });
          });

      if (!_.isUndefined(shareObject)) {
        var document_object = _.find(shareObject.documents, function(doc) {
          return doc.flowId === flowFile.uniqueIdentifier;
        });

        _.remove(shareObject.documents, document_object);
        _.remove(shareObject.waitingUploadIdentifiers, function(id) {
          return id === flowFile.uniqueIdentifier;
        });

        if (shareObject.documents.length === 0 || flowFile.error) {
          _.remove(share_array, shareObject);
        } else {
          var documentInUpload = _.find(shareObject.documents, function(doc) {
            return doc.flowid;
          });
          if (_.isUndefined(documentInUpload)) {
            new ShareObjectService(shareObject).share();
          }
        }
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
        isVisible: isVisible,
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
        if (form) {
          form.$setPristine();
          form.$setUntouched();
        }
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
