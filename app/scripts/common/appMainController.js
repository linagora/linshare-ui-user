'use strict';

angular.module('linshareUiUserApp')
.controller('UiUserMainController',
  function($window, $rootScope, $scope, $location, $state, $log, $translatePartialLoader, $translate, AuthenticationService, MenuService, growlService) {

    $translatePartialLoader.addPart('general');
    localStorage.setItem('ma-layout-status', 0);

    $scope.mactrl.sidebarToggle.left = false;
    if ($window.localStorage.getItem('sidebarToggleLeft') == 'true') {
      $scope.mactrl.sidebarToggle.left = true;
    }
    $scope.$watch("mactrl.sidebarToggle.left", function() {
      $window.localStorage.setItem('sidebarToggleLeft', $scope.mactrl.sidebarToggle.left);
    });
    $scope.sizeHeight = $window.innerHeight - 50;

    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      $scope.currentState = MenuService.getProperties(toState.name);
      $scope.linkActive = MenuService.getSectionName(toState.name);
    });
    AuthenticationService.getCurrentUser().then(function (user) {
      $scope.user = user;
    });

    $scope.$on('event:auth-loginRequired', function(event, data) {
      $log.debug('my state auth-loginRequired in the controller ', $rootScope.$state, $rootScope.$stateParams);
      $scope.urlTogoAfterLogin = $rootScope.$state.current.name;
      $log.debug('my URLLoginBefore', $scope.urlTogoAfterLogin);
      $state.go('login', {next: $scope.urlTogoAfterLogin});
    });
    $scope.$on('event:auth-loginConfirmed', function () {
      $log.debug('event:auth-loginConfirmed received');
      $log.debug('my URLloginafter', $scope.urlTogoAfterLogin);
      AuthenticationService.getCurrentUser().then(function (user) {
        $translate('WELCOME_USER').then(function(welcome) {
          growlService.growl(welcome + user.firstName + ' ' + user.lastName, 'inverse');
        })
        if ($scope.urlTogoAfterLogin != undefined && $scope.urlTogoAfterLogin != ' ' && $scope.urlTogoAfterLogin != 'login') {
          $state.go($scope.urlTogoAfterLogin);
        }
        else {
          $state.go('home');
        }
      });
    });

    $scope.reloadFiles = function() {
      $scope.$broadcast('linshare-upload-complete');
    }
  })
  .controller('LinshareAutocompleteController', function($scope, LinshareShareService, $log) {
    $scope.userRepresentation = function(u) {
      if (angular.isString(u)) {
        return u;
      }
      return u.firstName.concat(" ", u.lastName, " ", u.mail, " ", u.domain);
    };

    $scope.searchGuestRestrictedContacts = function(pattern) {
      return LinshareShareService.autocomplete(pattern);
    };

    $scope.addRecipients = function(users, contact) {
      var exists = false;
      angular.forEach(users, function(elem) {
        if (elem.mail == contact.mail && elem.domain == contact.domain) {
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
  });;
