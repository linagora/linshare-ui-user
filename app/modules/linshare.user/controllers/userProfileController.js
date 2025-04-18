angular.module('linshare.userProfile')
  .controller('userProfileController', userProfileController);

userProfileController.$inject = ['meRestService', 'lsAppConfig', 'profile', 'toastService', 'guestRestService', '$translate', '_'];

function userProfileController(meRestService, lsAppConfig, profile, toastService, guestRestService, $translate, _) {
  const userProfileVm = this;

  userProfileVm.$onInit = $onInit;
  userProfileVm.profile = profile;
  userProfileVm.lsAppConfig = lsAppConfig;
  userProfileVm.updateProfile = updateProfile;
  userProfileVm.isRestricted = profile.accountType === lsAppConfig.accountType.guest && profile.restricted;
  userProfileVm.restrictedContacts = [];
  userProfileVm.restrictedContactsLists = [];
  userProfileVm.sorterKey = 'firstName';
  userProfileVm.sorterKeyRestrictedContactsList = 'name';
  userProfileVm.sortAsc = true;
  userProfileVm.getOwnerName = getOwnerName;
  var byMe = $translate.refresh().then(function() {
    $translate(['ME']).then(function(translations) {
      byMe = translations.ME;
    });
  });

  function $onInit() {
    if (userProfileVm.isRestricted) {
      meRestService.getRestrictedContacts().then(contacts => {
        userProfileVm.restrictedContacts.push(...contacts);
      });
    }
    if (profile.accountType === lsAppConfig.accountType.guest) {
      guestRestService.listGuestRestrictContactslist(profile.uuid).then(contactsList => {
        userProfileVm.restrictedContactsLists.push(...contactsList);
      });
    }
  }

  function updateProfile() {
    meRestService.updateProfile(userProfileVm.profile).then(() => {
      toastService.success({key: 'USER_PROFILE.ALERT.UPDATE_SUCCESS'});
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
      if (item.contactList.owner.uuid === loggedUserUuid) {
        return byMe ;
      } else {
        return item.contactList.owner.firstName + ' ' + item.contactList.owner.lastName;
      }
    }
  }
}
