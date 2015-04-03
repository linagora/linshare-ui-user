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
  .controller('FilesController', function($scope,  $filter, filesService, ngTableParams, $window, $log){
    //$scope.user = user;
    $scope.download = function(){
      angular.forEach($scope.SelectedElement, function(uuid){
        filesService.downloadFiles(uuid).then(function(file) {
          console.log(file);
          var blob = new Blob([file], {type: 'text/plain'});
          $scope.url = window.URL.createObjectURL(blob);
          console.log('url', $scope.url);
         // $window.open(url);
        //return file;
      });

      });
    };
    $scope.SelectedElement = [];
    $scope.allFiles = filesService.getAllFiles();
    $scope.delete = function() {
      angular.forEach($scope.SelectedElement, function(uuid){
        $log.debug('value to delete', uuid);
        filesService.delete(uuid).then(function(){
          $scope.tableParams.reload();
          $scope.SelectedElement = [];
        });
      });
    };
    $scope.documentDetails = {};
    filesService.getThumbnail('55d3085d-2e93-4b19-a062-0974838982a5').then(function(thumbnail){
      console.log('cont', thumbnail.replace(/\s/g, ''));
      $scope.documenteur= btoa(thumbnail.replace(/\s/g, ''));
      //$scope.document.detail.thumbnail = btoa(encodeURI(thumbnail));
      //console.log('64', $scope.document.detail.thumbnail);
    });
    $scope.close = function() {
      console.log('error');
    };
    $scope.tableParams = new ngTableParams({
      page: 1,
      count: 20
    }, {
      getData: function($defer, params) {
        $scope.allFiles.then(function(files) {
          files = params.sorting() ? $filter('orderBy')(files, params.orderBy()) : files;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        });
      }

    })

  });
