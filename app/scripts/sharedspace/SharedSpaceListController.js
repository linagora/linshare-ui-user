'use strict';
angular.module('linshareUiUserApp')
  .controller('SharedSpaceListController', function ($scope) {
    $scope.currentPage = 'group_list_files';
    $scope.$on('$stateChangeSuccess', function () {
      angular.element('.multi-select-mobile').appendTo('body');
    });
  });
