'use strict';

angular.module('linshareUiUserApp')
  .controller('AuthenticationController', function($scope, AuthenticationService) {
    $scope.input = {};
    $scope.$on('event:auth-loginRequired', function(){

    })
    $scope.submitted = false;
    $scope.signupForm = function() {
      AuthenticationService.login($scope.input.email, $scope.input.password);
      console.log('currentUser', AuthenticationService.getCurrentUser());
    };
  });
