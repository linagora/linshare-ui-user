/**
 * contactsListsService
 * @namespace LinShare.contactsLists
 */
(function() {
  'use strict';

  angular
    .module('linshare.contactsLists')
    .factory('contactsListsService', contactsListsService);

  contactsListsService.$inject = ['_', '$translate', '$translatePartialLoader'];

  /**
   * @namespace contactsListsService
   * @descService to interact with ContactsListsList object by REST
   * @memberOf LinShare.contactsLists
   */
  function contactsListsService(_, $translate, $translatePartialLoader) {
    var
      byMe,
      service = {
        getOwnerName: getOwnerName
      };

    activate();

    return service;

    ////////////

    /**
     * @name activate
     * @desc Activation function of the service, launch at every instantiation
     * @memberOf LinShare.contactsLists.contactsListsService
     */
    function activate() {
      $translatePartialLoader.addPart('contactsLists');

      $translate.refresh().then(function() {
        $translate(['ME']).then(function(translations) {
          byMe = translations.ME;
        });
      });
    }

    /**
     * @name getOwnerName
     * @desc Get full name of owner
     * @param {Object} item - contactsList
     * @param {String} loggedUserUuid - user logged uuid
     * @returns {String} Name of owner formatted
     * @memberOf LinShare.contactsLists.contactsListsService
     */
    function getOwnerName(item, loggedUserUuid) {
      if (!_.isUndefined(item)) {
        if (item.owner.uuid === loggedUserUuid) {
          return byMe;
        } else {
          return item.owner.firstName + ' ' + item.owner.lastName;
        }
      }
    }
  }
})();
