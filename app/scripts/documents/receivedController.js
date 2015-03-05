/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .controller('ReceivedController', function($scope, receivedShare){
    $scope.test = receivedShare.getAllFiles();
  });
