/**
 * Created by Alpha Sall on 3/5/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .directive('authDirective', function(){
    return {
      replace: false,
      restrict: 'A',
      templateUrl: 'views/common/loginForm.html',
      controller: 'AuthenticationController'
    };
  });
