'use strict';

angular.module('linshareUiUserApp')
  .controller('ThreadController', function($scope, ThreadService){
    ThreadService.getAll().then(function(threads){
      $scope.threads = threads;
    });
  });
