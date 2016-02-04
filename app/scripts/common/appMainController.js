'use strict';

angular.module('linshareUiUserApp')
  .controller('materialadminCtrl', function($timeout, $state){

    // Detact Mobile Browser
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      angular.element('html').addClass('ismobile');
    }

    // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
    this.sidebarToggle = {
      left: false,
      right: false
    };

    // By default template has a boxed layout
    this.layoutType = localStorage.getItem('ma-layout-status');

    // For Mainmenu Active Class
    this.$state = $state;

    //Close sidebar on click
    this.sidebarStat = function(event) {
      if (!angular.element(event.target).parent().hasClass('active')) {
        this.sidebarToggle.left = false;
      }
    };

    //Listview Search (Check listview pages)
    this.listviewSearchStat = false;

    this.lvSearch = function() {
      this.listviewSearchStat = true;
    };

    //Listview menu toggle in small screens
    this.lvMenuStat = false;

  })


  // =========================================================================
  // Header
  // =========================================================================
  .controller('headerCtrl', function($timeout, $translate){

    // Top Search
    this.openSearch = function(){
      angular.element('#header').addClass('search-toggled');
    };

    this.closeSearch = function(){
      angular.element('#header').removeClass('search-toggled');
    };

    //Clear Notification
    this.clearNotification = function($event) {
      $event.preventDefault();

      var x = angular.element($event.target).closest('.listview');
      var y = x.find('.lv-item');
      var z = y.size();

      angular.element($event.target).parent().fadeOut();

      x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
      x.find('.grid-loading').fadeIn(1500);
      var w = 0;

      y.each(function(){
        var z = $(this);
        $timeout(function(){
          z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
            z.remove();
          });
        }, w+=150);
      });

      $timeout(function(){
        angular.element('#notifications').addClass('empty');
      }, (z*150)+200);
    };

    // Clear Local Storage
    var self = this;
    $translate(['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TITLE', 'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TEXT',
      'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.DONE',
      'SWEET_ALERT.ON_LOCALSTORAGE_DELETE.IS_CLEARED']).then(function(translations) {
      self.swalTitle = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TITLE'];
      self.swalText = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.TEXT'];
      self.swalConfirm = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.CONFIRM_BUTTON'];
      self.swalDone = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.DONE'];
      self.swalCleared = translations['SWEET_ALERT.ON_LOCALSTORAGE_DELETE.IS_CLEARED'];
    });

    this.clearLocalStorage = function() {

      //Get confirmation, if confirmed clear the localStorage
      var thisLocal = this;
      swal({
        title: this.swalTitle,
        text: this.swalText,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#F44336',
        confirmButtonText: this.swalConfirm,
        closeOnConfirm: false
      }, function(){
        localStorage.clear();
        swal(thisLocal.swalDone, thisLocal.swalCleared, 'success');
      });

    };

    //Fullscreen View
    this.fullScreen = function() {
      //Launch
      function launchIntoFullscreen(element) {
        if(element.requestFullscreen) {
          element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }

      //Exit
      function exitFullscreen() {
        if(document.exitFullscreen) {
          document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }

      if (exitFullscreen()) {
        launchIntoFullscreen(document.documentElement);
      }
      else {
        launchIntoFullscreen(document.documentElement);
      }
    };

  })

  .controller('UiUserMainController',
  function($window, $rootScope, $scope, $location, $state, $log, $translatePartialLoader, $translate,
           AuthenticationService, MenuService, growlService) {

    localStorage.setItem('ma-layout-status', 0);

    $scope.mactrl.sidebarToggle.left = false;
    if($window.localStorage.getItem('sidebarToggleLeft') === 'true') {
      $scope.mactrl.sidebarToggle.left = true;
    }
    $scope.$watch('mactrl.sidebarToggle.left', function() {
      $window.localStorage.setItem('sidebarToggleLeft', $scope.mactrl.sidebarToggle.left);
    });
    $scope.sizeHeight = $window.innerHeight - 50;

    $rootScope.$on('$stateChangeStart',
    function(event, toState) {
      $scope.currentState = MenuService.getProperties(toState.name);
      $scope.linkActive = MenuService.getSectionName(toState.name);
    });
    AuthenticationService.getCurrentUser().then(function (user) {
      $scope.loggedUser = user;
    });

    $scope.$on('event:auth-loginRequired', function() {
      $log.debug('event:auth-loginRequired : toState', $rootScope.toState);
      $scope.urlTogoAfterLogin = $rootScope.toState;
      if($scope.urlTogoAfterLogin === 'login') {
        $scope.urlTogoAfterLogin = 'home';
        $state.go('login');
      } else {
        $state.go('login', {next: $scope.urlTogoAfterLogin});
      }
      $scope.loggedUser = '';
    });

    $scope.$on('event:auth-loginConfirmed', function (event, data) {
      $log.debug('event:auth-loginConfirmed : toState', $scope.urlTogoAfterLogin);
      $scope.loggedUser = data;
      $state.go($scope.urlTogoAfterLogin);

      $translate('WELCOME_USER').then(function(welcome) {
        growlService.growl(welcome + data.firstName + ' ' + data.lastName, 'inverse');
      });
    });

    $scope.reloadFiles = function() {
      $scope.$broadcast('linshare-upload-complete');
    };
  })
  .controller('LinshareAutocompleteController', function($scope, LinshareShareService, $log) {
    $scope.userRepresentation = function(u) {
      if (angular.isString(u)) {
        return u;
      }
      return u.firstName.concat(' ', u.lastName, ' ', u.mail, ' ', u.domain);
    };

    $scope.searchGuestRestrictedContacts = function(pattern) {
      return LinshareShareService.autocomplete(pattern);
    };

    $scope.addRecipients = function(users, contact) {
      var exists = false;
      angular.forEach(users, function(elem) {
        if (elem.mail === contact.mail && elem.domain === contact.domain) {
          exists = true;
          $log.info('The contact ' + contact.mail + ' has already been added to that guest\'s restricted contacts');
        }
      });
      if (!exists) {
        users.push(_.omit(contact, 'restrictedContacts', 'uuid'));
      }
    };

    $scope.removeRecipients = function(users, index) {
      users.splice(index, 1);
    };
  });
