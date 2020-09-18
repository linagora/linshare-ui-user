/**
 * CreateContactsList Controller
 * @namespace LinShare.contactsLists
 */
(function () {
  'use strict';

  angular
    .module('linshare.contactsLists')
    .controller('CreateContactsList', CreateContactsList);

  CreateContactsList.$inject = [
    '$state',
    'lsAppConfig'
  ];

  /**
   * @namespace CreateContactsList
   * @desc Controller of the Contacts List creation
   * @memberOf LinShare.contactsList
   */
  function CreateContactsList(
    $state,
    lsAppConfig
  ) {
    var createContactsListVm = this;

    createContactsListVm.$onInit = $onInit;

    function $onInit() {
      createContactsListVm.goToContactsList = goToContactsList;
    }

    ////////////

    /**
     * @name goToContactsList
     * @desc Open the created Contacts List
     * @param {Object} contactsList - Contacts List object
     * @memberOf LinShare.contactsLists.contactsListsListController
     */
    function goToContactsList(contactsList) {
      $state.go('administration.contactslists.list.contacts', {
        from: lsAppConfig.contactsListsMinePage,
        contactsListName: contactsList.name,
        contactsListUuid: contactsList.uuid
      });
    }
  }
})();
