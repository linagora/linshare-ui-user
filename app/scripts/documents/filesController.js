/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';
/**
 * @ngdoc function
 * @name linshareUiUserApp.controller:FilesController
 * @description
 * # FilesController
 * Controller of the linshareUiUserApp
 */
angular.module('linshareUiUserApp')
  .controller('FilesController', function($scope,  $filter, filesService, ngTableParams, $window){
    //$scope.user = user;
$scope.download = function(uuid){
  filesService.downloadFiles(uuid).then(function(file){
    console.log(file);
    $scope.url = window.URL.createObjectURL(file);
    console.log('url', url);
    $window.open(url);
    //return file;

  });
};
    $scope.tableParams = new ngTableParams({
      page: 1,
      count: 10
    }, {
      getData: function($defer, params){
        filesService.getAllFiles().then(function(files){
          files = params.sorting() ? $filter('orderBy')(files, params.orderBy()) : files;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        });
      }

    })

  });
