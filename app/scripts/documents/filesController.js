/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .controller('FilesController', function($scope, filesService){
    $scope.test = filesService.getAllFiles();
  });
