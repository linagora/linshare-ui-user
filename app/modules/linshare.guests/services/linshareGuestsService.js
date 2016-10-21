(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .factory('LinshareGuestService', LinshareGuestService);

  LinshareGuestService.$inject = ['Restangular'];

  function LinshareGuestService(Restangular) {
    var baseGuestRest = Restangular.all('guests');

    var service = {
      findGuest: findGuest,
      getList: getList,
      addGuest: addGuest,
      deleteGuest: deleteGuest,
      updateGuest: updateGuest,
      assignGroup: assignGroup
    };

    return service;

    ////////////

    function findGuest(uuid) {
      return baseGuestRest.one(uuid).get();
    }

    function getList() {
      return baseGuestRest.getList();
    }

    function addGuest(guestDto) {
      return baseGuestRest.post(guestDto);
    }

    function deleteGuest(guestDto) {
      return baseGuestRest.remove(guestDto);
    }

    function updateGuest(uuid) {
      return baseGuestRest.put(uuid);
    }

    function assignGroup() {
      return null;
    }
  }
})();
