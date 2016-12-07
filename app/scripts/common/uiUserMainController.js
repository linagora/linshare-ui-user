'use strict';

angular
  .module('linshareUiUserApp')
  .controller('UiUserMainController',
    function($window, $rootScope, $scope, $location, $state, $log, $translatePartialLoader, $translate,
             authenticationRestService, MenuService, $timeout, LinshareUserService, lsAppConfig, $http, checkTableHeightService) {
      //TODO: shall be moved to the directive controller of linshareSidebar directive
      var Sidebar = function() {
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
      };

      var mainVm = this;
      mainVm.sidebar = new Sidebar();

      $rootScope.sidebarRightWidth = 350;
      $rootScope.sidebarLeftWidth = 268;
      $rootScope.mobileWidthBreakpoint = 768;
      localStorage.setItem('ma-layout-status', 0);

      $scope.workgroupPage = lsAppConfig.workgroupPage;
      $scope.mySpacePage = lsAppConfig.mySpacePage;

      $scope.$watch('mactrl.sidebarToggle.left', function() {
        $window.localStorage.setItem('sidebarToggleLeft', $scope.mactrl.sidebarToggle.left);
      });
      $scope.sizeHeight = $window.innerHeight - 50;
      $scope.$watch(function() {
        return $window.innerHeight;
      }, function() {
        $scope.sizeHeight = $window.innerHeight - 50;
      });

      $rootScope.$on('$stateChangeStart',
        function(event, toState) {
          $scope.currentState = MenuService.getProperties(toState.name);
          $scope.linkActive = MenuService.getSectionName(toState.name);
        });
      $scope.loggedUser = new LinshareUserService();

      authenticationRestService.getCurrentUser().then(function(user) {
        $scope.loggedUser.setUser(user);
        user.firstLetter = user.firstName.charAt(0);
        $scope.userLogged = user;
      });

      $scope.$on('event:auth-loginRequired', function() {
        $log.debug('event:auth-loginRequired : toState', $rootScope.toState);
        $scope.urlTogoAfterLogin = $rootScope.toState;
        $scope.loggedUser.getUser();
        if ($scope.urlTogoAfterLogin === 'login') {
          $scope.urlTogoAfterLogin = 'home';
          $state.go('login');
        } else {
          $state.go('login', {
            next: $scope.urlTogoAfterLogin
          });
        }
      });

      $scope.$on('event:auth-loginConfirmed', function(event, data) {
        $log.debug('event:auth-loginConfirmed : toState', $scope.urlTogoAfterLogin);
        $scope.loggedUser.setUser(data);
        $state.go($scope.urlTogoAfterLogin);
      });

      /**
       * This is the initial array of shares.
       * It will contain all the shares
       */
      $scope.share_array = [];

      // ref index flow shares {identifier: [key of waiting shares]}
      $scope.refFlowShares = {};

      this.resizeDragNDropCtn = function(attr) {
        checkTableHeightService.checkAndSetNewWidth(attr);
      };
      if ($scope.mactrl.sidebarToggle.left) {
        checkTableHeightService.checkAndSetNewWidth($scope.mactrl.sidebarToggle.left);
      }

      var widthWindow = angular.element(window).width();
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


      /**
       * Get the core version from the REST API
       * @type {string}
       */
      authenticationRestService.version().then(function(data) {
        $scope.coreVersion = data.version;
      });

      /**
       * Get the product version from the json file 'about'
       * @type {string}
       */
      $scope.productVersion = 'dev';
      $http.get('/about.json').success(function(data) {
        $scope.productVersion = data.version;
      });
    });
