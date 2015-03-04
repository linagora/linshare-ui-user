/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .controller('ReceivedController', function($scope, receivedShare){
    $scope.test = receivedShare.getAllFiles();
  });
/**
 * Created by vagrant on 3/4/15.
 */
