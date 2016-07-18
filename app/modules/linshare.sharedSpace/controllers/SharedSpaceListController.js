'use strict';
angular.module('linshareUiUserApp')
  .controller('SharedSpaceListController', function($scope, $log, currentWorkGroup, NgTableParams, $filter, DocumentUtilsService, growlService, WorkGroupRestService, $stateParams) {
    $scope.currentPage = 'group_list_files';
    $scope.$on('$stateChangeSuccess', function() {
      angular.element('.multi-select-mobile').appendTo('body');
    });

    $scope.loadSidebarContent = function(content) {
      $scope.sidebarRightDataType = content;
    };
    $scope.slideTextarea = function($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().addClass('show-full-comment');
    };
    $scope.slideUpTextarea = function($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().removeClass('show-full-comment');
    };
    $scope.setTextInput = function($event) {
      var currTarget = $event.currentTarget;
      var inputTxt = angular.element(currTarget).text();
      if(inputTxt === '') {
        angular.element(currTarget).parent().find('span').css('display', 'block');
      } else {
        angular.element(currTarget).parent().find('span').css('display', 'none');
      }
    };

    $scope.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20
    }, {
      getData: function ($defer, params) {
        var filesList = params.sorting() ? $filter('orderBy')(currentWorkGroup, params.orderBy()) : currentWorkGroup;
        params.total(filesList.length);
        $defer.resolve(filesList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  });
