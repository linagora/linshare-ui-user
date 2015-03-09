'use strict';

angular.module('linshareUiUserApp')
  .controller('AuthenticationController', function($scope, AuthenticationService, $location, $rootScope) {
    $scope.input = {};
    $scope.$on('event:auth-loginRequired', function(){
      $location.path('/login');
      console.log('scope $on', '$location.path()');
    });
    $scope.submitted = false;
    $scope.signupForm = function() {
      AuthenticationService.login($scope.input.email, $scope.input.password);
      console.log('currentUser from auth controller', AuthenticationService.getCurrentUser());
      //$rootScope.$on('event:auth-loginConfirmed', function(){
        $rootScope.isLoggedIn = true;
      //});
    };
    $scope.logout = function(){
      AuthenticationService.logout();
      $rootScope.isLoggedIn = false;
    }
  });
