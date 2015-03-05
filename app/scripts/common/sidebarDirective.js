
'use strict';

angular.module('linshareUiUserApp')
  .directive('lsSidebar', [
    function() {
      return {
        restrict: 'A',
       transclude: true,
        scope: false,
        controller: ['$rootScope', '$scope', '$log', 'MenuService',
          function($rootScope, $scope, $log, MenuService) {
            //Authentication.getCurrentUser().then(function(user) {
            //  console.log('in my directive');
              $scope.tabs = MenuService.getAvailableTabs();
            console.log('my scope', $scope.tabs);
            //  $scope.linkActive = false;
            //});
          }
        ],
        templateUrl: 'views/common/sidebar.html',
        replace: false
      };
    }
  ]);
