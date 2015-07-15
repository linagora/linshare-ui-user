'use strict';

angular.module('linshareUiUserApp')
  .controller('LinshareGuestController', ['$scope', 'LinshareGuestService', function($scope, LinshareGuestService){
    LinshareGuestService.getList().then(function(guests) {
      $scope.guestList = guests;
    });

    $scope.guest = {name: 'John Doe'};
}]);
