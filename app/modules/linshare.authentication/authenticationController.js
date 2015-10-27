'use strict';

angular.module('linshare.authentication')
  .controller('AuthenticationController',
    ['$scope', '$modal', '$log', 'AuthenticationService', '$location', '$state',
      function ($scope, $modal, $log, AuthenticationService, $location, $state) {

        $scope.$on('event:auth-loginRequired', function () {
          $log.debug('event:auth-loginRequired received');
        });
        $scope.input = {};
        $scope.submitted = false;
        $scope.signupForm2 = function() {
          AuthenticationService.login($scope.input.email, $scope.input.password);
          console.log('auth success: current user', AuthenticationService.getCurrentUser());
        };

        $scope.logout = function() {
          AuthenticationService.logout();
        };
      }
    ]);
