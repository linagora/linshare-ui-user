'use strict';
/**
 * @ngdoc directive
 * @name linshareUiUserApp.directive:linshareNavHeader
 * @description
 *
 * This is the directive to show the nav header of the app
 */
angular.module('linshareUiUserApp')
  .directive('linshareNavHeader', function(){
    return {
      restrict: 'A',
      replace: true,
      controller: 'AuthenticationController',
      templateUrl: 'views/common/navbar.html'
    };
  });
