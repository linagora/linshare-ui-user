
'use strict';

angular.module('linshareUiUserApp')
  .directive('lsSidebar', [
    function() {
      return {
        restrict: 'A',
        transclude: true,
        scope: false,
        controller: ['$rootScope', '$scope', '$state', '$log', 'MenuService',
          function($rootScope, $scope, $state, $log, MenuService) {
            $scope.tabs = MenuService.getAvailableTabs();
            $scope.changeColor = function (color) {
              if (this.link.disabled === false) {
                this.customColor = {'color': color};
              }
            };
          }
        ],
        link: function(scope, element) {
          scope.sizeNavigation = {'height': element[0].offsetHeight - (76+110)+'px'};
          element.parent().bind('oncontextmenu', function(){
          });
        },
        templateUrl: 'views/common/sidebar.html',
        replace: false
      };
    }
  ]);
