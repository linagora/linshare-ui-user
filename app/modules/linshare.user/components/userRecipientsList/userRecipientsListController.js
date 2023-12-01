angular
  .module('linshare.userProfile')
  .controller('userRecipientsListController', userRecipientsListController);

userRecipientsListController.$inject = [
  '_',
  '$q',
  '$log',
  '$translate',
  'dialogService',
  'meRestService',
  'tableParamsService',
  'toastService'
];

function userRecipientsListController(
  _,
  $q,
  $log,
  $translate,
  dialogService,
  meRestService,
  tableParamsService,
  toastService
) {
  const userRecipientsListVm = this;

  userRecipientsListVm.filterText = '';
  userRecipientsListVm.paramFilter = { recipient: '' };
  userRecipientsListVm.$onInit = $onInit;
  userRecipientsListVm.remove = remove;

  function $onInit() {
    meRestService.getFavouriteRecipients().then(recpients => {
      userRecipientsListVm.list = recpients.map(e => ({ uuid: e.recipient, ...e }));

      tableParamsService.initTableParams(userRecipientsListVm.list, userRecipientsListVm.paramFilter)
        .then(() => {
          userRecipientsListVm.tableParamsService = tableParamsService;
          userRecipientsListVm.selectAllOnCurrentPage = tableParamsService.tableSelectAll;
          userRecipientsListVm.toggleSelection = tableParamsService.toggleItemSelection;
          userRecipientsListVm.selectedRecipients = tableParamsService.getSelectedItemsList();
          userRecipientsListVm.tableParams = tableParamsService.getTableParams();
          userRecipientsListVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
          userRecipientsListVm.toggleFilterBySelectedItems = tableParamsService.getToggleSelectedSort();
          userRecipientsListVm.resetSelectedItems = tableParamsService.resetSelectedItems;
        });
    });
  }

  function remove(recipients) {
    openWarningDialog(recipients)
      .then(() => $q.allSettled(recipients.map(recipient =>
        meRestService.deleteFavouriteRecipient(recipient.recipient)
      )))
      .then(promises => {
        const deleted = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const nondeleted = promises
          .filter(promise => promise.state === 'rejected')
          .map(promise => promise.reason);

        _.remove(userRecipientsListVm.list, (item) =>
          deleted.some((request) => request.recipient === item.uuid)
        );

        _.remove(userRecipientsListVm.selectedRecipients, (selected) =>
          deleted.some((request) => request.recipient === selected.uuid)
        );

        userRecipientsListVm.tableParamsService.reloadTableParams(
          userRecipientsListVm.list
        );
        userRecipientsListVm.resetSelectedItems();

        if (nondeleted.length) {
          toastService.error({
            key: 'USER_PROFILE.FAVOURITE_RECIPIENTS.TOAST_ALERT.DELETE.ERROR',
            pluralization: true,
            params: {
              singular: nondeleted.length === 1,
              number: nondeleted.length
            }
          });
        } else {
          toastService.info({
            key: 'USER_PROFILE.FAVOURITE_RECIPIENTS.TOAST_ALERT.DELETE.INFO',
            pluralization: true,
            params: {
              singular: deleted.length === 1,
              number: deleted.length
            }
          });
        }
      })
      .catch(error => {
        if (error) {
          $log.error(error);
        }
      });
  }

  function openWarningDialog(recipients) {
    return $q.all([
      $translate(
        'USER_PROFILE.FAVOURITE_RECIPIENTS.DIALOG.DELETE.TEXT',
        {
          nbItems: recipients.length,
          singular: recipients.length <= 1 ? 'true' : 'other'
        },
        'messageformat'
      ),
      $translate([
        'USER_PROFILE.FAVOURITE_RECIPIENTS.DIALOG.DELETE.TITLE',
        'ACTION.PROCEED',
        'NAVIGATION.CANCEL'
      ])
    ])
      .then(promises => dialogService.dialogConfirmation({
        text: promises[0],
        title: promises[1]['USER_PROFILE.FAVOURITE_RECIPIENTS.DIALOG.DELETE.TITLE'],
        buttons: {
          confirm: promises[1]['ACTION.PROCEED'],
          cancel: promises[1]['NAVIGATION.CANCEL']
        }
      }, 'warning'))
      .then(isConfirmed => !!isConfirmed || $q.reject());
  }
}
