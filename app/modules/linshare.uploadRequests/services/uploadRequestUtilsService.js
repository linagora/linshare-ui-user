angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestUtilsService', uploadRequestUtilsService);

uploadRequestUtilsService.$inject = [
  'sidebarService',
  '$q',
  '$mdDialog',
  '$translate',
  'dialogService',
  'toastService',
  'lsAppConfig'
];

function uploadRequestUtilsService(
  sidebarService,
  $q,
  $mdDialog,
  $translate,
  dialogService,
  toastService,
  lsAppConfig
) {

  return {
    openWarningDialogFor,
    showToastAlertFor,
    openAddingRecipientsSideBar
  };

  ////////////

  function openWarningDialogFor(action, uploadRequests) {
    if (action === 'archive') {
      return promptArchiveDialog(uploadRequests);
    }

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

  function showToastAlertFor(action, type, items = []) {
    if (action === 'unexpected_error') {
      toastService.error({
        key: 'UPLOAD_REQUESTS.TOAST_ALERT.SHOW_UNEXPECTED_ERROR'
      });
    } else {
      return toastService[type]({
        key: `UPLOAD_REQUESTS.TOAST_ALERT.${action.toUpperCase()}.${type.toUpperCase()}`,
        pluralization: true,
        params: {
          singular: items.length === 1,
          number: items.length
        }
      }, action === 'copy_entries' && 'TOAST_ALERT.ACTION_BUTTON');
    }
  }

  function openAddingRecipientsSideBar(uploadRequestGroupObject) {
    sidebarService.setData({ uploadRequestGroupObject });
    sidebarService.setContent(lsAppConfig.uploadRequestGroupAddRecipients);
    sidebarService.show();
  }

  function promptArchiveDialog(uploadRequests = []) {
    return $mdDialog.show({
      template: require('../views/archiveUploadRequestDialog.html'),
      controller: 'archiveUploadRequestDialogController',
      controllerAs: 'archiveUploadRequestDialogVm',
      bindToController: true,
      numberUploadRequests: uploadRequests.length
    });
  }
}
