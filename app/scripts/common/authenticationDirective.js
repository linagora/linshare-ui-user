'use strict';

angular.module('linshareUiUserApp')
  .directive('authDirective', function(){
    return {
      replace: false,
      restrict: 'A',
      templateUrl: '../../modules/linshare.authentication/views/loginForm.html',
      controller: 'AuthenticationController',
      controllerAs: 'authenticationVm'
    };
  });
