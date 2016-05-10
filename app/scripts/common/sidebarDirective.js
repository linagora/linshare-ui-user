
'use strict';

angular.module('linshareUiUserApp')
  .directive('lsSidebar', ['$timeout',
    function($timeout) {
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
          $timeout(function() {
            scope.sizeNavigation = {'height': element[0].offsetHeight - (76+110)+'px'};
          }, 0);
        },
        templateUrl: 'views/common/sidebar.html',
        replace: false
      };
    }
  ]);
