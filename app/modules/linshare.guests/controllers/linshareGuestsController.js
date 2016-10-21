(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .controller('LinshareGuestsController', LinshareGuestsController);

  LinshareGuestsController.$inject = ['$scope', '$translatePartialLoader', '$log', 'LinshareGuestService'];

  function LinshareGuestsController($scope, $translatePartialLoader, $log, LinshareGuestService) {
    /* jshint validthis: true */
    var guestVm = this;
    guestVm.guestList = [];
    //TODO: To be removed: sample data
    guestVm.guest = {name: 'John Doe'};

    //TODO: should this be here ?
    $scope.mactrl.sidebarToggle.right = true;
    $translatePartialLoader.addPart('guests');
    $scope.sidebarRightDataType = 'add-guest';

    activate();

    ////////////

    function activate() {
      return getGuestList().then(function() {
        $log.debug('Activated Linshare Guest View');
      });
    }

    function getGuestList() {
      return LinshareGuestService.getList()
        .then(function(data) {
          guestVm.guestList = data;
          return guestVm.guestList;
        });
    }
  }
})();
