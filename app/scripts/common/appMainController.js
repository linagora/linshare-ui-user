'use strict';

angular.module('linshareUiUserApp')
.controller('UiUserMainController', function($rootScope, $scope, $location, $state, $log, $translatePartialLoader) {

    $translatePartialLoader.addPart('general');
    localStorage.setItem('ma-layout-status', 1);

    $scope.$on('event:auth-loginRequired', function(event, data) {
      $log.debug('my state auth-loginRequired in the controller ', $rootScope.$state, $rootScope.$stateParams);
      $scope.urlTogoAfterLogin = $rootScope.$state.current.name;
      $log.debug('my URLLoginBefore', $scope.urlTogoAfterLogin);
      $state.go('login', {next: $scope.urlTogoAfterLogin});
    });
    $scope.$on('event:auth-loginConfirmed', function () {
      $log.debug('event:auth-loginConfirmed received');
      $log.debug('my URLloginafter', $scope.urlTogoAfterLogin);
      if ($scope.urlTogoAfterLogin != undefined && $scope.urlTogoAfterLogin != ' ' && $scope.urlTogoAfterLogin != 'login') {
        $state.go($scope.urlTogoAfterLogin);
      }
      else {
        $state.go('home');
      }
    });
  });
