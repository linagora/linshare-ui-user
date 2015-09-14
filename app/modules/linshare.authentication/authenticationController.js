'use strict';

angular.module('linshare.authentication')
  .controller('AuthenticationController',
    ['$scope', '$modal', '$log', 'AuthenticationService', '$location', '$state',
      function ($scope, $modal, $log, AuthenticationService, $location, $state) {

      var modalInstance;
      $scope.$on('event:auth-loginRequired', function () {
        $log.debug('event:auth-loginRequired received');
        //$location.path('/login.html');
        //if (angular.isUndefined(modalInstance)) {
        //  modalInstance = $modal.open({
        //    backdrop: 'static',
        //    controller: modalInstanceCtrl,
        //    templateUrl: 'modules/linshare.authentication/loginForm.html'
        //  });
        //}
      });
      $scope.input = {};
      $scope.submitted = false;
      $scope.signupForm2 = function() {
        AuthenticationService.login($scope.input.email, $scope.input.password);
        console.log('auth success: current user', AuthenticationService.getCurrentUser());
        //$rootScope.isLoggedIn = true;
      };
      //$scope.$on('event:auth-loginConfirmed', function () {
      //  $log.debug('event:auth-loginConfirmed received');
      //  //$state.go('files');
      //});
      $scope.logout = function() {
        AuthenticationService.logout();
        //$rootScope.isLoggedIn = false;
      };
      //AuthenticationService.getCurrentUser().then(function(user) {
      //  $scope.user = user;
      //})
  }]);

//var modalInstanceCtrl = function($scope, $modalInstance, AuthenticationService,  $rootScope){
//  $scope.input = {};
//  $scope.$on('event:auth-loginRequired', function(){
//    //$location.path('/login');
//    console.log('scope $on', '$location.path()');
//  });
//  $scope.submitted = false;
//  $scope.signupForm = function() {
//    AuthenticationService.login($scope.input.email, $scope.input.password);
//    console.log('auth success: current user', AuthenticationService.getCurrentUser());
//    $rootScope.isLoggedIn = true;
//  };
//};
