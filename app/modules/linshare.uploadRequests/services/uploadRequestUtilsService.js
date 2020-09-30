angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestUtilsService', uploadRequestUtilsService);

uploadRequestUtilsService.$inject = ['$q', '$translate', 'dialogService', 'toastService'];

function uploadRequestUtilsService($q, $translate, dialogService, toastService) {

  return {
    openWarningDialogFor: openWarningDialogFor,
    showToastAlertFor: showToastAlertFor
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
      }, 'warning'));
  }

  function showToastAlertFor(action, type, items) {
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
