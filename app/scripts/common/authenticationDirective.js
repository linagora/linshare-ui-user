'use strict';

angular.module('linshareUiUserApp')
  .directive('authDirective', function(){
    return {
      replace: false,
      restrict: 'A',
      templateUrl: 'modules/linshare.authentication/loginForm.html',
      controller: 'AuthenticationController'
    };
  });
