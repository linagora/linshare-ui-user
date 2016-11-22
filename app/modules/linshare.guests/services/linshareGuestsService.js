/**
 * LinshareGuestSetvice Factory
 * @namespace LinShare.guest
 */
(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .factory('LinshareGuestService', LinshareGuestService);

  LinshareGuestService.$inject = ['Restangular', 'ServerManagerService'];

  /**
   *  @namespace LinshareGuestService
   *  @desc Communication service with API to manage Guest Object
   *  @memberOf NameSpaceGlobal
   */
  function LinshareGuestService(Restangular, ServerManagerService) {
    var
      baseGuestRest = Restangular.all('guests'),
      service = {
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

    /**
     *  @name getList
     *  @desc Get the list of guest
     *  @param {Boolean} allGuest - Query param value for requesting all guest or not
     *  @returns {Promise} The response of the server
     *  @memberOf LinShare.guests.LinshareGuestService
     */
    function getList(allGuest) {
      return ServerManagerService.responseHandler(baseGuestRest.getList(null, {all:allGuest}));
    }

    /**
     *  @name addGuest
     *  @desc Add a guest object
     *  @param {Object} guestDTO - The guest object to be updated
     *  @returns {Promise} The response of the server
     *  @memberOf LinShare.guests.LinshareGuestService
     */
    function addGuest(guestDto) {
      return ServerManagerService.responseHandler(baseGuestRest.post(guestDto));
    }

    /**
     *  @name deleteGuest
     *  @desc Delete a Guest object
     *  @param {String} uuid - uuid of the Guest object
     *  @returns {Promise} server reponse
     *  @memberOf LinShare.guests.LinshareGuestService
     */
    function deleteGuest(uuid) {
      return ServerManagerService.responseHandler(Restangular.one('guests', uuid).remove());
    }

    /**
     *  @name updateGuest
     *  @desc Update a guest object
     *  @param {String} uuid - Uuid of the guest
     *  @param {Object} guestDTO - The guest object to be updated
     *  @returns {Promise} The response of the server
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
