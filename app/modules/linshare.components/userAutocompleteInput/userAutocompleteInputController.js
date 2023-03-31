angular
  .module('linshare.components')
  .controller('userAutocompleteInputController', userAutocompleteInputController);

userAutocompleteInputController.$inject = [
  '$q',
  '$log',
  '$translate',
  'authenticationRestService',
  'autocompleteUserRestService',
  'dialogService',
  'functionalityRestService',
  'guestRestService',
  'ownerLabel',
  'toastService'
];

function userAutocompleteInputController(
  $q,
  $log,
  $translate,
  authenticationRestService,
  autocompleteUserRestService,
  dialogService,
  functionalityRestService,
  guestRestService,
  ownerLabel,
  toastService
) {
  const inputVm = this;
  const RegexpEmail = /^\S+@\S+\.\S+$/;

  inputVm.$onInit = $onInit;
  inputVm.searchUsers = searchUsers;
  inputVm.onSelectedItemChange = onSelectedItemChange;
  inputVm.createGuestFromMail = createGuestFromMail;

  ///////////

  function $onInit() {
    $q.all([
      authenticationRestService.getCurrentUser(),
      functionalityRestService.getAll()
    ]).then(([loggedUser, { COMPLETION, GUESTS }]) => {
      inputVm.canCreateGuest =  GUESTS.enable && inputVm.allowCreatingGuest;
      inputVm.textLengthToTriggerSearch = COMPLETION.value;

      if (loggedUser.restricted) {
        inputVm.allowAddingEmail = false;
      }
    });
  }

  function onSelectedItemChange(item) {
    inputVm.searchPattern = '';

    if (item) {
      inputVm.onSelect(item);
    }
  }

  function createGuestFromMail(mail) {
    $q.all([
      $translate('SWEET_ALERT.ON_GUEST_QUICK_CREATE.TEXT', { mail }),
      $translate('SWEET_ALERT.ON_GUEST_QUICK_CREATE.TITLE'),
      $translate('SWEET_ALERT.ON_GUEST_QUICK_CREATE.CONFIRM_BUTTON'),
      $translate('SWEET_ALERT.ON_GUEST_QUICK_CREATE.CANCEL_BUTTON')
    ])
      .then(([text, title, confirm, cancel]) => dialogService.dialogConfirmation({
        title,
        text,
        buttons: { cancel, confirm }
      }))
      .then(confirmed => confirmed ? guestRestService.create({ mail }) : $q.reject())
      .then(guest => {
        toastService.success({key: 'SIDEBAR.NOTIFICATION.SUCCESS.CREATE'});
        inputVm.searchPattern = '';
        inputVm.onSelect({
          type: 'user',
          identifier: guest.uuid,
          domain: guest.domain,
          mail: guest.mail
        });
      })
      .catch(error => error && $log.error(error));
  }

  function searchUsers() {
    return autocompleteUserRestService.search(inputVm.searchPattern, inputVm.searchType, undefined, inputVm.accountType)
      .then(checkEmptyResult)
      .then(generateLabels);
  }

  function checkEmptyResult(results = []) {
    if (!results.length && inputVm.allowAddingEmail && RegexpEmail.test(inputVm.searchPattern)) {
      results.push({
        canCreateGuest: inputVm.canCreateGuest,
        mail: inputVm.searchPattern,
        identifier: inputVm.searchPattern,
        type: 'simple'
      });
    }

    return results;
  }

  function generateLabels(results = []) {
    return results.map(result => {
      result.label = {};

      switch (result.type) {
        case 'user':
          result.label.firstLetter = (result.firstName && result.firstName.charAt(0)) || (result.mail && result.mail.charAt(0));
          result.label.name = result.firstName && result.lastName && `${result.firstName} ${result.lastName}` || result.mail;
          result.label.info = result.mail;
          break;

        case 'simple':
          result.label.firstLetter = result.identifier.charAt(0).toUpperCase();
          result.label.name = result.identifier;
          break;

        case 'mailinglist':
          result.label.style = 'ls-contact-list-item';
          result.label.firstLetter = '';
          result.label.name = result.listName;
          result.label.info = ownerLabel.getOwner({
            firstName: result.ownerFirstName,
            lastName: result.ownerLastName,
            mail: result.ownerMail
          });
          break;

        case 'threadmember':
          result.label.style = result.member && 'firstLetterBgdGreen';
          result.label.firstLetter = result.firstName.charAt(0);
          result.label.name = `${result.firstName} ${result.lastName}`;
          result.label.info = result.mail;
          break;

        default:
          result.label = result;
          break;
      }

      return result;
    });
  }
}
