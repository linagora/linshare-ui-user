'use strict';

angular.module('linshare.authentication')
  .controller('AuthenticationController',
    ['$scope', '$modal', '$log', 'AuthenticationService', '$location', '$state', 'localStorageService',
      function ($scope, $modal, $log, AuthenticationService, $location, $state, localStorageService) {

        $scope.$on('event:auth-loginRequired', function () {
          $log.debug('event:auth-loginRequired received');
        });
        var todosInStore = localStorageService.get('login');
        $scope.input = todosInStore || {};
        $scope.submitted = false;
        $scope.signupForm2 = function() {
          AuthenticationService.login($scope.input.email, $scope.input.password);
          localStorageService.set('login', $scope.input);
          console.log('auth success: current user', AuthenticationService.getCurrentUser());
        };

        $scope.logout = function() {
          AuthenticationService.logout();
        };
      }
    ]);
