angular
  .module('linshare.token')
  .factory('tokenManagementUtilsService', tokenManagementUtilsService);

tokenManagementUtilsService.$inject = [
  '$mdDialog',
  'toastService'
];

function tokenManagementUtilsService(
  $mdDialog,
  toastService
) {

  return {
    promptCreatedToken,
    showToastAlertFor
  };
  ////////////

  function promptCreatedToken(token) {
    return $mdDialog.show({
      template: require('../views/createdTokenDialog.html'),
      controller: 'createdTokenDialogController',
      bindToController: true,
      controllerAs: 'createdTokenDialogVm',
      locals: {
        token: token
      }
    });
  }

  function showToastAlertFor(action, type) {
    if (action === 'create') {
      toastService[type]({
        key: `TOKEN_MANAGEMENT.TOAST_ALERT.CREATE.${type.toUpperCase()}`
      });
    }

    if (action === 'update') {
      toastService[type]({
        key: `TOKEN_MANAGEMENT.TOAST_ALERT.UPDATE.${type.toUpperCase()}`
      });
    }
  }
}
