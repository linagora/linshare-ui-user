angular
  .module('linshare.token')
  .controller('tokenManagementController', tokenManagementController);

tokenManagementController.$inject = [
  '_',
  '$q',
  '$log',
  '$translate',
  'dialogService',
  'jwtRestService',
  'tableParamsService',
  'toastService',
  'sidebarService',
  '$scope',
  'lsAppConfig'
];

function tokenManagementController(
  _,
  $q,
  $log,
  $translate,
  dialogService,
  jwtRestService,
  tableParamsService,
  toastService,
  sidebarService,
  $scope,
  lsAppConfig
) {
  const tokenManagementVm = this;

  tokenManagementVm.$onInit = onInit;
  tokenManagementVm.selectedToken = {};
  tokenManagementVm.selectedIndex = 0;
  tokenManagementVm.fabButton = {
    toolbar: {
      activate: true,
      label: 'TOKEN_MANAGEMENT.TITLE'
    },
    actions: [
      {
        action: () => {
          tokenManagementVm.openCreatingTokenSidebar();
        },
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
        tokenManagementVm.removeTokens = removeTokens;
        tokenManagementVm.loadSidebarContent = loadSidebarContent;
        tokenManagementVm.openCreatingTokenSidebar = openCreatingTokenSidebar;
        tokenManagementVm.openEditingTokenSidebar = openEditingTokenSidebar;
        tokenManagementVm.showDetails = showDetails;
        tokenManagementVm.selectToken = selectToken;
        tokenManagementVm.onCreateSuccess = onCreateSuccess;
        tokenManagementVm.onUpdateSuccess = onUpdateSuccess;
      })
      .catch(error => {
        $log.error('Failed to init table', error);
      })
      .finally(() => {
        tokenManagementVm.loading = false;
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

  function removeTokens(tokens) {
    return confirmTokensDeletion(tokens)
      .then(() => $q.allSettled(tokens.map(token => jwtRestService.remove(token.uuid))))
      .then(promises => {
        const removedTokens = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notRemovedTokens = promises
          .filter(promise => promise.state === 'rejected')
          .map(reject => reject.reason);

        if (removedTokens.some(token => token.uuid === tokenManagementVm.selectedToken.uuid)) {
          sidebarService.hide();
        }


        _.remove(tokenManagementVm.itemsList, item => removedTokens.some(request => request.uuid === item.uuid));
        _.remove(tokenManagementVm.selectedTokens, selected => removedTokens.some(request => request.uuid === selected.uuid));

        tokenManagementVm.tableParams.reload().then(function(data) {
          if (data.length === 0 && tokenManagementVm.tableParams.total() > 0) {
            tokenManagementVm.tableParams.page(tokenManagementVm.tableParams.page() - 1);
            tokenManagementVm.tableParams.reload();
          };
        });

        return {
          removedTokens,
          notRemovedTokens
        };
      })
      .then(({ removedTokens, notRemovedTokens }) => {
        if (notRemovedTokens.length) {
          alertDeteledTokens('error', notRemovedTokens);
        } else {
          alertDeteledTokens('info', removedTokens);
        }
      })
      .catch(error => error && $log.error(error));;
  }

  function selectToken(token) {
    tokenManagementVm.selectedToken = angular.copy(token);
  }

  function confirmTokensDeletion(tokens) {
    return $q.all([
      $translate(
        'TOKEN_MANAGEMENT.DIALOG.DELETE.TEXT',
        {
          numberOfTokens: tokens.length,
          singular: tokens.length <= 1 ? 'true' : 'other'
        },
        'messageformat'
      ),
      $translate([
        'TOKEN_MANAGEMENT.DIALOG.DELETE.TITLE',
        'ACTION.PROCEED',
        'NAVIGATION.CANCEL'
      ])
    ])
      .then(promises => dialogService.dialogConfirmation({
        text: promises[0],
        title: promises[1]['TOKEN_MANAGEMENT.DIALOG.DELETE.TITLE'],
        buttons: {
          confirm: promises[1]['ACTION.PROCEED'],
          cancel: promises[1]['NAVIGATION.CANCEL']
        }
      }, 'warning'))
      .then(confirmed => !!confirmed || $q.reject());
  }

  function alertDeteledTokens(type, tokens) {
    toastService[type]({
      key: `TOKEN_MANAGEMENT.TOAST_ALERT.DELETE.${type.toUpperCase()}`,
      pluralization: true,
      params: {
        singular: tokens.length === 1,
        number: tokens.length
      }
    });
  }

  function loadSidebarContent(content) {
    $scope.mainVm.sidebar.setData(tokenManagementVm);
    $scope.mainVm.sidebar.setContent(content);
    $scope.mainVm.sidebar.show();
  }

  function showDetails(token) {
    loadSidebarContent(lsAppConfig.tokenDetails, token);
  }

  function openCreatingTokenSidebar() {
    tokenManagementVm.tokenObject = {};
    loadSidebarContent(lsAppConfig.tokenCreate);
  }

  function openEditingTokenSidebar(token) {
    tokenManagementVm.selectedIndex = 1;
    showDetails(token);
  }

  function onCreateSuccess(created) {
    sidebarService.hide();
    tokenManagementVm.itemsList.unshift(created);
    tokenManagementVm.tableParams.reload();
  }

  function onUpdateSuccess(updated) {
    sidebarService.hide();

    const itemIndex = tokenManagementVm.itemsList.findIndex(item => item.uuid === updated.uuid);

    if (itemIndex >= 0) {
      tokenManagementVm.itemsList[itemIndex] = updated;
      tokenManagementVm.tableParams.reload();
    }
  }
}