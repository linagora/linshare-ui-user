
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
            var setLinkActive = function (currentState) {
              angular.forEach($scope.tabs, function(value) {
                if (value.links) {
                  angular.forEach(value.links, function(link) {
                    if (link.link == currentState) {
                      $scope.linkActive = value.name;
                    }
                  })
                } else if (value.link == currentState) {
                  $scope.linkActive = value.name;
                }
              });
            };

            setLinkActive($state.current.name);

            $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                setLinkActive(toState.name);
            });
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
