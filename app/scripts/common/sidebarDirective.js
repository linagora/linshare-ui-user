
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
            $scope.tabs = MenuService.getAvailableTabs();
          }
        ],
        link: function(scope, element) {
          element.parent().bind('oncontextmenu', function(){
          });
        },
        templateUrl: 'views/common/sidebar.html',
        replace: false
      };
    }
  ]);
