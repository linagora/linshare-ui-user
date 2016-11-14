(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .factory('LinshareGuestService', LinshareGuestService);

  LinshareGuestService.$inject = ['Restangular', 'ServerManagerService'];

  function LinshareGuestService(Restangular, ServerManagerService) {
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

    /**
     *  @name addGuest
     *  @desc Add a guest object
     *  @param {Object} guestDTO - The guest object to be updated
     *  @returns {Object} The response of the server
     *  @memberOf LinShare.guests.LinshareGuestService
     */
    function addGuest(guestDto) {
      return ServerManagerService.responseHandler(baseGuestRest.post(guestDto));
    }

    function deleteGuest(guestDto) {
      return baseGuestRest.remove(guestDto);
    }

    /**
     *  @name updateGuest
     *  @desc Update a guest object
     *  @param {String} uuid - Uuid of the guest
     *  @param {Object} guestDTO - The guest object to be updated
     *  @returns {Object} The response of the server
     *  @memberOf LinShare.guests.LinshareGuestService
     */
    //TODO: the put should be on guests/{uuid}, to be corrected B&F
    function updateGuest(uuid, guestDTO) {
      return ServerManagerService.responseHandler(Restangular.one('guests', uuid).customPUT(guestDTO));
    }

    function assignGroup() {
      return null;
      }
  }
})();
