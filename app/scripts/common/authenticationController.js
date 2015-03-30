'use strict';


angular.module('linshareUiUserApp')
  .controller('AuthenticationController', function($scope, $modal, $log, AuthenticationService, $location, $rootScope) {
  //  $scope.input = {};
  //  $scope.$on('event:auth-loginRequired', function(){
  //    $rootScope.isLoggedIn = false;
  //    $location.path('/login');
  //  });
  //  $scope.$on('event:auth-loginConfirmed', function(){
  //    $rootScope.isLoggedIn = true;
  //  });
  //  $scope.submitted = false;
  //  $scope.signupForm = function() {
  //    AuthenticationService.login($scope.input.email, $scope.input.password);
  //    console.log('auth success: current user', AuthenticationService.getCurrentUser());
  //    $rootScope.isLoggedIn = true;
  //  };
  //  $scope.logout = function() {
  //    AuthenticationService.logout();
  //    $log.debug('logout scope from controoler');
  //    $location.path('login');
  //    $rootScope.isLoggedIn = false;
  //  }
  //});


    var modalInstance;
    $scope.$on('event:auth-loginRequired', function () {
      $log.debug('event:auth-loginRequired received');
      //$location.path('/login');
      if (angular.isUndefined(modalInstance)) {
        modalInstance = $modal.open({
          backdrop: 'static',
          controller: modalInstanceCtrl,
          templateUrl: 'views/common/loginForm.html'
        });
      }
    });
    $scope.$on('event:auth-loginConfirmed', function () {
      $log.debug('event:auth-loginConfirmed received');
      if (angular.isDefined(modalInstance)) {
        modalInstance.close();
      }
      modalInstance = undefined;
    });
    $scope.logout = function() {
      AuthenticationService.logout();
      $rootScope.isLoggedIn = false;
    }
  });

var modalInstanceCtrl = function($scope, $modalInstance, AuthenticationService,  $rootScope){
  $scope.input = {};
  $scope.$on('event:auth-loginRequired', function(){
    //$location.path('/login');
    console.log('scope $on', '$location.path()');
  });
  $scope.submitted = false;
  $scope.signupForm = function() {
    AuthenticationService.login($scope.input.email, $scope.input.password);
    console.log('auth success: current user', AuthenticationService.getCurrentUser());
    $rootScope.isLoggedIn = true;
  };
};
