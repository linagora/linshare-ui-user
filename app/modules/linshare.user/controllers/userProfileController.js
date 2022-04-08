angular.module('linshare.userProfile')
  .controller('userProfileController', userProfileController);

userProfileController.$inject = ['meRestService', 'lsAppConfig', 'profile', 'toastService'];

function userProfileController(meRestService, lsAppConfig, profile, toastService) {
  const userProfileVm = this;

  userProfileVm.$onInit = $onInit;
  userProfileVm.profile = profile;
  userProfileVm.lsAppConfig = lsAppConfig;
  userProfileVm.updateProfile = updateProfile;
  userProfileVm.isRestricted = profile.accountType === lsAppConfig.accountType.guest && profile.restricted;
  userProfileVm.restrictedContacts = [];
  userProfileVm.sorterKey = 'firstName';
  userProfileVm.sortAsc = true;

  function $onInit() {
    if (userProfileVm.isRestricted) {
      meRestService.getRestrictedContacts().then(contacts => {
        userProfileVm.restrictedContacts.push(...contacts);
      });
    }
  }

  function updateProfile() {
    meRestService.updateProfile(userProfileVm.profile).then(() => {
      toastService.success({key: 'USER_PROFILE.ALERT.UPDATE_SUCCESS'});
    });
  }
}
