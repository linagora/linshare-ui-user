(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .controller('LinshareGuestsController', LinshareGuestsController);

  LinshareGuestsController.$inject = ['$scope', '$translatePartialLoader', '$log', 'LinshareGuestService', 'lsAppConfig'];

  function LinshareGuestsController($scope, $translatePartialLoader, $log, LinshareGuestService, lsAppConfig) {
    /* jshint validthis: true */
    var guestVm = this;

    //TODO: To be removed: sample data
    guestVm.guest = {name: 'John Doe'};
    guestVm.guestList = [];
    guestVm.getGuestList = getGuestList;
    guestVm.loadSidebarContent = loadSidebarContent;
    $translatePartialLoader.addPart('guests');

    activate();

    ////////////

    function activate() {
      return getGuestList().then(function() {
        $log.debug('Activated Linshare Guest View');
        guestVm.loadSidebarContent(lsAppConfig.addGuest);
      });
    }

    function getGuestList() {
      return LinshareGuestService.getList()
        .then(function(data) {
          guestVm.guestList = data;
          return guestVm.guestList;
        });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} cotent The id of the content to load, see app/views/includes/sidebar-right.html for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData($scope);
      $scope.mainVm.sidebar.setContent(content || lsAppConfig.share);
      $scope.mainVm.sidebar.show();
    }
  }
})();
