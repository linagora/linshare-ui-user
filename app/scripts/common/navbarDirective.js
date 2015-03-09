'use strict';

angular.module('linshareUiUserApp')
  .directive('linshareNavHeader', function(AuthenticationService){
    return {
      restrict: 'A',
      replace: true,
      controller: 'AuthenticationController',
      templateUrl: 'views/common/navbar.html'
    }
  });
