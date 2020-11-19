angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestUtilsService', uploadRequestUtilsService);

uploadRequestUtilsService.$inject = [
  'sidebarService',
  '$q',
  '$translate',
  'dialogService',
  'toastService',
  'lsAppConfig'
];

function uploadRequestUtilsService(
  sidebarService,
  $q,
  $translate,
  dialogService,
  toastService,
  lsAppConfig
) {

  return {
    openWarningDialogFor,
    showToastAlertFor,
    archiveConfirmOptionDialog,
    openAddingRecipientsSideBar
  };

  ////////////

  function openWarningDialogFor(action, uploadRequests) {
    return $q.all([
      $translate(
        `UPLOAD_REQUESTS.DIALOG.${action.toUpperCase()}.TEXT`,
        {
          nbItems: uploadRequests.length,
          singular: uploadRequests.length <= 1 ? 'true' : 'other'
        },
        'messageformat'
      ),
      $translate([
        `UPLOAD_REQUESTS.DIALOG.${action.toUpperCase()}.TITLE`,
        'ACTION.PROCEED',
        'NAVIGATION.CANCEL'
      ])
    ])
      .then(promises => dialogService.dialogConfirmation({
        text: promises[0],
        title: promises[1][`UPLOAD_REQUESTS.DIALOG.${action.toUpperCase()}.TITLE`],
        buttons: {
          confirm: promises[1]['ACTION.PROCEED'],
          cancel: promises[1]['NAVIGATION.CANCEL']
        }
      }, 'warning'))
      .then(isConfirmed => !!isConfirmed || $q.reject());
  }

  function archiveConfirmOptionDialog() {
    return $translate([
      'UPLOAD_REQUESTS.DIALOG.ARCHIVE.OPTION_TEXT',
      'UPLOAD_REQUESTS.DIALOG.ARCHIVE.TITLE',
      'UPLOAD_REQUESTS.DIALOG.ARCHIVE.COPY.CONFIRM',
      'UPLOAD_REQUESTS.DIALOG.ARCHIVE.COPY.CANCEL'
    ])
      .then(result => dialogService.dialogConfirmation({
        text: result['UPLOAD_REQUESTS.DIALOG.ARCHIVE.OPTION_TEXT'],
        title: result['UPLOAD_REQUESTS.DIALOG.ARCHIVE.TITLE'],
        buttons: {
          confirm: result['UPLOAD_REQUESTS.DIALOG.ARCHIVE.COPY.CONFIRM'],
          cancel: result['UPLOAD_REQUESTS.DIALOG.ARCHIVE.COPY.CANCEL']
        }
      }, 'warning'));
  }

  function showToastAlertFor(action, type, items = []) {
    if (action === 'archive' && (type === 'error' || type === 'info')) {
      toastService[type]({
        key: `UPLOAD_REQUESTS.TOAST_ALERT.ARCHIVE.${type.toUpperCase()}`,
      });
    } else {
      toastService[type]({
        key: `UPLOAD_REQUESTS.TOAST_ALERT.${action.toUpperCase()}.${type.toUpperCase()}`,
        pluralization: true,
        params: {
          singular: items.length === 1,
          number: items.length
        }
      });
    }
  }

  function openAddingRecipientsSideBar(uploadRequestGroupObject) {
    sidebarService.setData({ uploadRequestObject: uploadRequestGroupObject });
    sidebarService.setContent(lsAppConfig.uploadRequestGroupAddRecipients);
    sidebarService.show();
    setTimeout(() => angular.element('#focusInputShare').trigger('focus'));
  }
}
