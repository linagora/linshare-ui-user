angular
  .module('linshare.token')
  .controller('tokenManagementFormController', tokenManagementFormController);

tokenManagementFormController.$inject = [
  'lsAppConfig',
  'jwtRestService',
  'sidebarService',
  'tokenManagementUtilsService'
];

function tokenManagementFormController(
  lsAppConfig,
  jwtRestService,
  sidebarService,
  tokenManagementUtilsService
) {
  const tokenManagementFormVm = this;
  const { promptCreatedToken, showToastAlertFor } = tokenManagementUtilsService;
  const { onCreateSuccess } = sidebarService.getData();

  tokenManagementFormVm.$onInit = onInit;
  tokenManagementFormController.createToken = createToken;

  function onInit() {
    if (sidebarService.getContent() === lsAppConfig.tokenCreate) {
      sidebarService.addData('createToken', createToken);
    }
    setTimeout(() => angular.element('#tokenLabel').trigger('focus'), 300);
  }

  function createToken() {
    jwtRestService.create(tokenManagementFormVm.tokenObject)
      .then(created => {
        promptCreatedToken(created.token);
        showToastAlertFor('create', 'success');
        onCreateSuccess(created);
      }).catch(error => {
        if (error) {
          showToastAlertFor('create', 'error');
        }
      });
  }
}
