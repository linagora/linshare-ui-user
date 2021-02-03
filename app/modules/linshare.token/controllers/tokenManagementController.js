angular
  .module('linshare.token')
  .controller('tokenManagementController', tokenManagementController);

tokenManagementController.$inject = [
  '$log',
  'jwtRestService',
  'tableParamsService'
];

function tokenManagementController(
  $log,
  jwtRestService,
  tableParamsService
) {
  const tokenManagementVm = this;

  tokenManagementVm.$onInit = onInit;
  tokenManagementVm.currentSelectedDocument = {};
  tokenManagementVm.fabButton = {
    toolbar: {
      activate: true,
      label: 'TOKEN_MANAGEMENT.TITLE'
    },
    actions: [
      {
        label: 'TOKEN_MANAGEMENT.CREATE',
        icon: 'ls-token',
      }
    ]
  };

  function onInit() {
    tokenManagementVm.loading = true;

    fetchTokens()
      .then(() => tableParamsService.initTableParams(tokenManagementVm.itemsList))
      .then(() => {
        tokenManagementVm.tableParamsService = tableParamsService;
        tokenManagementVm.resetSelectedTokens = tableParamsService.resetSelectedItems;
        tokenManagementVm.selecteTokensOnCurrentPage = tableParamsService.tableSelectAll;
        tokenManagementVm.toggleTokenSelection = tableParamsService.toggleItemSelection;
        tokenManagementVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
        tokenManagementVm.selectTokensOnCurrentPage = tableParamsService.tableSelectAll;
        tokenManagementVm.toggleFilterBySelectedItems = tableParamsService.isolateSelection;;
        tokenManagementVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
        tokenManagementVm.selectedTokens = tableParamsService.getSelectedItemsList();
        tokenManagementVm.tableParams = tableParamsService.getTableParams();
        tokenManagementVm.loading = false;
      })
      .catch(error => {
        $log.error('Failed to init table', error);
      });
  }

  function fetchTokens() {
    return jwtRestService.list()
      .then(tokens => tokenManagementVm.itemsList = tokens)
      .catch(error => {
        $log.error('Failed to fetch tokens', error);

        return [];
      });
  }
}