'use strict';
angular.module('linshare.guests', ['restangular', 'ui.bootstrap', 'linshare.components'])

  .controller('guestController', function ($scope, $translatePartialLoader) {
    $scope.mactrl.sidebarToggle.right = true;
    $translatePartialLoader.addPart('guests');
    $scope.sidebarRightDataType = 'add-guest';



  });
