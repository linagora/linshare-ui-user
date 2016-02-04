'use strict';

angular.module('linshare.authentication')
  .controller('AuthenticationController',
    ['$scope', '$log', 'AuthenticationService',
      function ($scope, $log, AuthenticationService) {

        $scope.submitted = false;
        //todo form validate
        $scope.submitLoginForm = function() {
          AuthenticationService.login($scope.input.email, $scope.input.password);
        };

        $scope.logout = function() {
          AuthenticationService.logout();
        };
      }
    ]);
