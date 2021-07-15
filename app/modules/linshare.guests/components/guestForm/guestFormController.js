angular
  .module('linshare.guests')
  .controller('guestFormController', guestFormController);

guestFormController.$inject = ['lsAppConfig', 'sidebarService', 'formUtilsService'];

function guestFormController(lsAppConfig, sidebarService, formUtilsService) {
  const formVm = this;
  const { onUpdatedGuest, onCreatedGuest } = sidebarService.getData();

  formVm.productionMode = lsAppConfig.production;
  formVm.toggleAdvancedOptions = toggleAdvancedOptions;
  formVm.onRestrictedChange = onRestrictedChange;
  formVm.getRestrictedContactsValidity = getRestrictedContactsValidity;
  formVm.$onInit = $onInit;

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
    }
  }

  function toggleAdvancedOptions() {
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
      formVm.guestObject.create().then(onCreatedGuest);
    } else {
      formUtilsService.setSubmitted(formVm.form);
    }
  }

  function getRestrictedContactsValidity() {
    const validity = formVm.guestObject.restricted && formVm.guestObject.restrictedContacts.length > 0;

    formVm.form.$setValidity('restrictedContactsRequired', validity);

    return validity;
  }
}