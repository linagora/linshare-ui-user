'use strict';

angular.module('linshare.authentication')
  .controller('AuthenticationController',
    ['$scope', '$log', 'AuthenticationService',
      function ($scope, $log, AuthenticationService) {

        $scope.input = {email: '', password: ''};
        $scope.submitted = false;
        //todo form validate
        $scope.submitLoginForm = function() {
          AuthenticationService.login($scope.input.email, $scope.input.password);
          $log.debug('auth success: current user', AuthenticationService.getCurrentUser());
        };

        $scope.logout = function() {
          AuthenticationService.logout();
        };
      }
    ]);
