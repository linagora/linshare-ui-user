/**
 * createContactsList Directive
 * @namespace LinShare.contactsLists
 */
(function() {
  'use strict';

  angular
    .module('linshare.contactsLists')
    .directive('createContactsList', createContactsList);

  createContactsList.$inject = [
    '_',
    '$q',
    '$translatePartialLoader',
    'contactsListsListRestService',
    'contactsListsContactsRestService',
    'toastService'
  ];

  /**
   * @namespace createContactsList
   * @desc Create Contacts List component
   * @example <create-contacts-list create-contacts-list-contacts-to-be-added="contactsToBeAdded" />
   * @memberOf LinShare.contactsLists
   */
  function createContactsList(
    _,
    $q,
    $translatePartialLoader,
    contactsListsListRestService,
    contactsListsContactsRestService,
    toastService
  ) {
    var directive = {
      controller: 'CreateContactsList',
      controllerAs: 'createContactsListVm',
      link: linkFn,
      restrict: 'A',
      scope: {
        contactsToBeAdded: '=createContactsListContactsToBeAdded',
      },
      templateUrl: 'modules/linshare.contactsLists/directives/createContactsList/createContactsList.html'
    };

    return directive;

    ////////////

    /**
     * @name linkFn
     * @desc DOM manipulation function, related to the directive
     * @param {Object} scope - Angular scope object of the directive
     * @param {Object} element - jqLite-wrapped element that this directive matches
     * @param {Object} attrs - Normalized attribute names and their corresponding attribute values
     * @param {Object} controller - Directive's required controller instance(s)
     * @memberOf LinShare.contactsLists.createContactsList
     */
    function linkFn(scope, element, attrs, controller) {
      $translatePartialLoader.addPart('contactsLists');
      scope.createContactsListWithContacts = createContactsListWithContacts;

      /**
      * @name createContactsList
      * @desc Create a Contacts List and add contacts
      * @param {string} contactsListName - Name of the Contacts List to create
      * @param {Array<Object>} contactsToBeAdded - List of contacts to add in the Contacts List
      * @returns {Promise} Response of the server
      * @memberOf linshare.components.CreateContactsList.linkFn
      */
      function createContactsListWithContacts(contactsListName, contactsToBeAdded) {
        var newContactsList = contactsListsListRestService.restangularize({
          name: contactsListName
        });

        newContactsList
          .save()
          .then(function (contactsList) {
            addContactsInContactsList(
              contactsList.uuid,
              contactsToBeAdded
            );
            scope.contactsListName = '';

            return notifyAction(contactsList);
          })
          .catch(function(error) {
            if (error.data && error.data.errCode === 25001) {
              toastService.error({ key: 'TOAST_ALERT.ERROR.RENAME_CONTACTS_LIST' });
            }
          });
      }

      /**
       * @name notifyAction
       * @desc Notify the result of Contacts List creation
       * @param {Object} contactsList - Contacts List object
       * @memberOf LinShare.contactsLists.CreateContactsList
       */
      function notifyAction(contactsList) {
        toastService
          .success(
          {
            key: 'TOAST_ALERT.ACTION.CONTACTS_LIST_CREATION',
            params: {
              contactsListName: contactsList.name
            }
          },
          'TOAST_ALERT.ACTION_BUTTON'
          )
          .then(function(response) {
            if (response && response.actionClicked) {
              controller.goToContactsList(contactsList);
            }
          });
      }
    }

    /**
     * @name addContactsInContactsList
     * @desc Add contacts to the created Contacts List
     * @param {string} contactsListUuid - Uuid of the created Contacts List
     * @param {Array<Object>} contactsToBeAdded - List of contacts to add in the Contacts List
     * @returns {Promise} Response of the server
     * @memberOf linshare.components.CreateContactsList
     */
    function addContactsInContactsList(contactsListUuid, contactsToBeAdded) {
      return $q.allSettled(
        _.map(
          contactsToBeAdded,
          function(contactToBeAdded) {
            return contactsListsContactsRestService.create(
              contactsListUuid,
              contactToBeAdded
            );
          }
        )
      );
    }
  }
})();
