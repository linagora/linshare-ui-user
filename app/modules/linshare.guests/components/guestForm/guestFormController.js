angular
  .module('linshare.guests')
  .controller('guestFormController', guestFormController);

guestFormController.$inject = [
  '$q',
  'authenticationRestService',
  'formUtilsService',
  'guestRestService',
  'lsAppConfig',
  'sidebarService',
  'GUEST_MODERATOR_ROLES'
];

function guestFormController(
  $q,
  authenticationRestService,
  formUtilsService,
  guestRestService,
  lsAppConfig,
  sidebarService,
  GUEST_MODERATOR_ROLES
) {
  const formVm = this;
  const { onUpdatedGuest, onCreatedGuest } = sidebarService.getData();
  const loggedUser = authenticationRestService.getCurrentUser().$$state.value;


  formVm.$onInit = $onInit;
  formVm.addGuestModerator = addGuestModerator;
  formVm.removeGuestModerator = removeGuestModerator;
  formVm.getRestrictedContactsValidity = getRestrictedContactsValidity;
  formVm.onRestrictedChange = onRestrictedChange;
  formVm.toggleRestrictedField = toggleRestrictedField;
  formVm.productionMode = lsAppConfig.production;
  formVm.selectedRole = GUEST_MODERATOR_ROLES[0];
  formVm.GUEST_MODERATOR_ROLES = GUEST_MODERATOR_ROLES;

  ///////

  function onRestrictedChange() {
    if (formVm.guestObject.restricted && !formVm.guestObject.restrictedContacts.length ) {
      formVm.guestObject.restrictedContacts = [...formVm.guestObject.defaultRestrictedContacts];
    }
  }

  function $onInit() {
    if (sidebarService.getContent() === lsAppConfig.guestDetails) {
      sidebarService.addData('updateGuest', updateGuest);
    }

    if (sidebarService.getContent() === lsAppConfig.guestCreate) {
      sidebarService.addData('createGuest', createGuest);
      formVm.moderators = [{
        role: 'ADMIN',
        account: {
          uuid: loggedUser.uuid,
          name: `${loggedUser.firstName} ${loggedUser.lastName}`,
          email: loggedUser.mail,
          domain: {
            uuid: loggedUser.domain
          }
        }
      }];
    }
  }

  function toggleRestrictedField() {
    formVm.guestObject.form.activateUserSpace = !formVm.guestObject.form.activateUserSpace;
    formVm.guestObject.restricted = !formVm.guestObject.form.activateUserSpace ? false : formVm.guestObject.restricted;
  }

  function updateGuest() {
    if (formVm.form.$valid) {
      formVm.guestObject.update().then(onUpdatedGuest);
    } else {
      formUtilsService.setSubmitted(formVm.form);
    }
  }

  function createGuest() {
    if (formVm.form.$valid) {
      formVm.guestObject.create()
        .then(createGuestModerators)
        .then(onCreatedGuest);
    } else {
      formUtilsService.setSubmitted(formVm.form);
    }
  }

  function getRestrictedContactsValidity() {
    const validity = !formVm.guestObject.canUpload ||
      !formVm.guestObject.restricted ||
      (
        formVm.guestObject.restricted &&
        formVm.guestObject.restrictedContacts.length > 0
      );

    if (formVm.form) {
      formVm.form.$setValidity('restrictedContactsRequired', validity);
    }

    return validity;
  }

  function createGuestModerators(createdGuest) {
    const promises = [];

    formVm.moderators.forEach((moderator, index) => {
      if (index === 0) {
        return;
      }

      promises.push(guestRestService.createGuestModerator({
        ...moderator,
        guest: {
          uuid: createdGuest.uuid
        }
      }));
    });

    return $q.all(promises);
  }

  function addGuestModerator(autocompleteResult) {
    const alreadyAdded = formVm.moderators.findIndex(moderator => moderator.account.uuid === autocompleteResult.identifier);

    if (alreadyAdded === 0) {
      return;
    }

    const moderator = {
      role: formVm.selectedRole,
      account: {
        uuid: autocompleteResult.identifier,
        name: autocompleteResult.label.name,
      }
    };

    if (alreadyAdded > 0) {
      formVm.moderators.splice(alreadyAdded, 1, moderator);
    } else {
      formVm.moderators.push(moderator);
    }
  }

  function removeGuestModerator(target) {
    formVm.moderators = formVm.moderators.filter(moderator => moderator.account.uuid !== target.account.uuid);
  }
}
