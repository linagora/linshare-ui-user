/**
 * contactsListsContactsRestService
 * @namespace LinShare.contactsLists
 */
(function() {
  'use strict';

  angular
    .module('linshare.contactsLists')
    .factory('contactsListsContactsRestService', contactsListsContactsRestService);

  contactsListsContactsRestService.$inject = [
    '_',
    '$log',
    'Restangular',
    'ServerManagerService'
  ];

  /**
   * @namespace contactsListsContactsRestService
   * @descService to interact with ContactsListsContact object by REST
   * @memberOf LinShare.contactsLists
   */
  function contactsListsContactsRestService(
    _,
    $log,
    Restangular,
    ServerManagerService
  ) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'contact_lists',
      restParam = 'contacts',
      service = {
        create: create,
        delete: remove,
        get: get,
        getList: getList,
        update: update
      };

    return service;

    ////////////

    /**
     * @name create
     * @desc Create a contactsList object
     * @param {String} contactsListUuid - The contactsList uuid
     * @param {Object} contact - The contact object
     * @returns {Promise} server response
     * @memberOf LinShare.contactsLists.contactsListsContactsRestService
     */
    function create(contactsListUuid, contact) {
      $log.debug('contactsListsContactsRestService - create');

      var propertyToPick = [
        'firstName',
        'lastName',
        'mail'
      ];
      var contactDto = contact.account
        ? _.pick(contact.account, propertyToPick)
        : _.pick(contact, propertyToPick);

      return handler(Restangular.one(restUrl, contactsListUuid).all(restParam).post(contactDto));
    }

    /**
     * @name get
     * @desc Get a contactsList object
     * @param {String} contactsListUuid - The contactsList uuid
     * @param {String} contactUuid - The contact uuid
     * @returns {Promise} server response
     * @memberOf LinShare.contactsLists.contactsListsContactsRestService
     */
    function get(contactsListUuid, contactUuid) {
      $log.debug('contactsListsContactsRestService - get ', contactsListUuid, contactUuid);
      
      return handler(Restangular.one(restUrl, contactsListUuid).one(restParam, contactUuid).get());
    }

    /**
     * @name getList
     * @desc Get all contacts of a contactsList
     * @param {String} contactsListUuid - The contactsList uuid
     * @returns {Promise} server response
     * @memberOf LinShare.contactsLists.contactsListsContactsRestService
     */
    function getList(contactsListUuid) {
      $log.debug('contactsListsContactsRestService - getList');
      
      return handler(Restangular.one(restUrl, contactsListUuid).getList(restParam));
    }

    /**
     * @name remove
     * @desc Remove a contactsList object
     * @param {String} contactsListUuid - The contactsList uuid
     * @param {String} contactUuid - The contact's uuid
     * @returns {Promise} server response
     * @memberOf LinShare.contactsLists.contactsListsContactsRestService
     */
    function remove(contactsListUuid, contactUuid) {
      $log.debug('contactsListsContactsRestService - delete');
      
      return handler(Restangular.one(restUrl, contactsListUuid).one(restParam, contactUuid).remove());
    }

    /**
     * @name update
     * @desc Update a contact object
     * @param {String} contactsListUuid - The contactsList uuid
     * @param {Object} contact - The contact object
     * @returns {Promise} server response
     * @memberOf LinShare.contactsLists.contactsListsContactsRestService
     */
    function update(contactsListUuid, contact) {
      $log.debug('contactsListsContactsRestService - update');
      
      return handler(Restangular.one(restUrl, contactsListUuid).one(restParam, contact.uuid).customPUT(contact));
    }
  }
})();
