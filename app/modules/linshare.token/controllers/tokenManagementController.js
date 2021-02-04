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
  tokenManagementVm.currentSelectedDocument = {};
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
        tokenManagementVm.loading = false;
        tokenManagementVm.loadSidebarContent = loadSidebarContent;
        tokenManagementVm.openCreatingTokenSidebar = openCreatingTokenSidebar;
        tokenManagementVm.tokenCreate = lsAppConfig.tokenCreate;
        tokenManagementVm.onCreateSuccess = onCreateSuccess;
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

        if (removedTokens.some(token => token.uuid === tokenManagementVm.currentSelectedDocument.current.uuid)) {
          sidebarService.hide();
        }


        _.remove(tokenManagementVm.itemsList, item => removedTokens.some(request => request.uuid === item.uuid));
        _.remove(tokenManagementVm.selectedTokens, selected => removedTokens.some(request => request.uuid === selected.uuid));

        tokenManagementVm.tableParams.reload();

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
      });
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
      .then(confirmed => !!confirmed || $q.reject())
      .catch(error => error && $log.error(error));
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

  function loadSidebarContent(content, tokenObject = {}) {
    tokenManagementVm.tokenObject = tokenObject;
    $scope.mainVm.sidebar.setData(tokenManagementVm);
    $scope.mainVm.sidebar.setContent(content);
    $scope.mainVm.sidebar.show();
  }

  function openCreatingTokenSidebar() {
    tokenManagementVm.loadSidebarContent(tokenManagementVm.tokenCreate);
  }

  function onCreateSuccess(created) {
    $scope.mainVm.sidebar.hide();
    tokenManagementVm.itemsList.unshift(created);
    tokenManagementVm.tableParams.reload();
  }
}