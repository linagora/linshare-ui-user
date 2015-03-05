/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .controller('FilesController', function($scope, filesService, user){
    $scope.user = user;
    filesService.getAllFiles().then(function(files){
      $scope.test = files;
    });
  });
