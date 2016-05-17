'use strict';

angular.module('linshareUiUserApp')
  .controller('ThreadController', function($scope, ThreadService, NgTableParams, $filter){
    //ThreadService.getAll().then(function(threads) {
    //  $scope.threads = threads;
    //});

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 20
    }, {
      getData: function($defer, params) {
        ThreadService.getAll().then(function(threads) {
          threads = params.sorting() ? $filter('orderBy')(threads, params.orderBy()) : threads;
          params.total(threads.length);
          $defer.resolve(threads.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        });
      }

    });
  });
