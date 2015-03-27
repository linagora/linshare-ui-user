/**
 * Created by Alpha O. Sall on 3/3/15.
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
    $scope.SelectedElement = [];
    $scope.delete = function(){

        filesService.delete('76524135-e906-4783-bd86-8e012c4ccf96');
      console.log('delete MOIIOIOI');
    };

    $scope.close = function(){
      console.log('error');
    };
    $scope.tableParams = new ngTableParams({
      page: 1,
      count: 20
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
