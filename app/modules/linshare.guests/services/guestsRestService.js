/**
 * guestRestService factory
 * @namespace LinShare.guests
 */
(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .factory('guestRestService', guestRestService);

  guestRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace guestRestService
   *  @desc Service to interact with Guest object by REST
   *  @memberof LinShare.guests
   */
  function guestRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'guests',
      service = {
        create,
        createGuestModerator,
        get,
        getList,
        listGuestModerator,
        remove,
        removeGuestModerator,
        update,
        updateGuestModerator
      };

    return service;

    ////////////

    /**
     *  @name create
     *  @desc create a Guest object
     *  @param {object} guestdto - The Guest object
     *  @returns {promise} server response
     *  @memberof linshare.guests.Linshareguestservice
     */
    function create(guestDto) {
      $log.debug('LinshareGuestRestService : create', guestDto);

      return handler(Restangular.all(restUrl).post(guestDto));
    }

    /**
     *  @name get
     *  @desc Get a guest object
     *  @param {String} uuid - The id of the Guest object
     *  @returns {Promise} server response
     *  @memberof LinShare.guests.guestRestService
     */
    function get(uuid) {
      $log.debug('LinshareGuestRestService : get', uuid);

      return handler(Restangular.all(restUrl).one(uuid).get());
    }

    /**
     *  @name getList
     *  @desc Get list of the guest object
     *  @param {Boolean} allGuest - Query param value for requesting all guest or not
     *  @returns {Promise} server response
     *  @memberof LinShare.guests.guestRestService
     */
    //TODO - KLE: Doc & Query Param shall be updated one the back allow other guest instead of all guest
    function getList(allGuest) {
      $log.debug('LinshareGuestRestService : getList', allGuest);

      return handler(Restangular.all(restUrl).getList({'mine': allGuest}));
    }

    /**
     *  @name remove
     *  @desc remove a Guest object
     *  @param {object} guestdto - The Guest object
     *  @returns {promise} server response
     *  @memberof linshare.guests.linshareguestservice
     */
    function remove(guestDto) {
      $log.debug('LinshareGuestRestService : remove', guestDto);

      return handler(Restangular.one(restUrl, guestDto.uuid).remove());
    }

    /**
     *  @name updateGuest
     *  @desc Update a guest object
     *  @param {String} uuid - The id of the Guest object
     *  @param {Object} guestDto - The Guest object
     *  @returns {promise} server response
     *  @memberOf LinShare.guests.guestRestService
     */
    //TODO: the put should be on guests/{uuid}, to be corrected B&F
    function update(uuid, guestDto) {
      $log.debug('LinshareGuestRestService : update', uuid, guestDto);

      return handler(Restangular.one(restUrl, uuid).customPUT(guestDto));
    }

    function listGuestModerator(guestUuid) {
      $log.debug('LinshareGuestRestService : listGuestModerator', guestUuid);

      return handler(Restangular.one(restUrl, guestUuid).all('moderators').getList().then(res => Restangular.stripRestangular(res)));
    }

    function createGuestModerator(moderator) {
      $log.debug('LinshareGuestRestService : createGuestModerator', moderator);

      return handler(Restangular.one(restUrl, moderator.guest.uuid).all('moderators').post(moderator).then(res => Restangular.stripRestangular(res)));
    }

    function updateGuestModerator(moderator) {
      $log.debug('LinshareGuestRestService : updateGuestModerator', moderator);

      return handler(Restangular
        .one(restUrl, moderator.guest.uuid)
        .one('moderators',moderator.uuid)
        .customPUT(moderator)
        .then(res => Restangular.stripRestangular(res))
      );
    }

    function removeGuestModerator(moderator) {
      $log.debug('LinshareGuestRestService : removeGuestModerator', moderator);

      return handler(Restangular
        .one(restUrl, moderator.guest.uuid)
        .one('moderators', moderator.uuid)
        .remove()
      );
    }
  }
})();
