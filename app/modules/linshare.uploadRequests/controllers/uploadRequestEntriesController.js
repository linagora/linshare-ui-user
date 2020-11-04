angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestEntriesController', uploadRequestEntriesController);

uploadRequestEntriesController.$inject = [
  '_',
  '$state',
  'tableParamsService',
  'uploadRequest',
  'uploadRequestGroup',
  'uploadRequestRestService',
  'UPLOAD_REQUESTS_STATE_STATUS_MAPPING'
];


function uploadRequestEntriesController(
  _,
  $state,
  tableParamsService,
  uploadRequest,
  uploadRequestGroup,
  uploadRequestRestService,
  UPLOAD_REQUESTS_STATE_STATUS_MAPPING
) {
  const uploadRequestEntriesVm = this;

  uploadRequestEntriesVm.$onInit = onInit;
  uploadRequestEntriesVm.goBack = goBack;
  uploadRequestEntriesVm.uploadRequest = uploadRequest;
  uploadRequestEntriesVm.isArchived = uploadRequest.status === 'ARCHIVED';
  uploadRequestEntriesVm.backgroundContent = getBackgroundContent();
  uploadRequestEntriesVm.paramFilter = { name: '' };
  uploadRequestEntriesVm.fabButton = {
    toolbar: {
      activate: true,
      label: 'UPLOAD_REQUESTS.TITLE_SINGULAR'
    },
    actions: [
      {
        label: 'UPLOAD_REQUESTS.TABLE.OPTIONS.ADD_RECIPIENTS',
        icon: 'ls-add-user-sm',
      }
    ]
  };

  function onInit() {
    return uploadRequestRestService.listEntries(uploadRequest.uuid)
      .then(entries => {
        uploadRequestEntriesVm.itemsList = entries;

        tableParamsService.initTableParams(uploadRequestEntriesVm.itemsList, uploadRequestEntriesVm.paramFilter)
          .then(() => {
            uploadRequestEntriesVm.currentSelectedEntry = {};
            uploadRequestEntriesVm.tableParamsService = tableParamsService;
            uploadRequestEntriesVm.resetSelectedEntries = tableParamsService.resetSelectedItems;
            uploadRequestEntriesVm.selectEntriesOnCurrentPage = tableParamsService.tableSelectAll;
            uploadRequestEntriesVm.addSelectedEntry = tableParamsService.toggleItemSelection;
            uploadRequestEntriesVm.sortDropdownSetActive = tableParamsService.tableSort;
            uploadRequestEntriesVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
            uploadRequestEntriesVm.toggleSearchState = toggleSearchState;
            uploadRequestEntriesVm.selectedEntries = tableParamsService.getSelectedItemsList();
            uploadRequestEntriesVm.tableParams = tableParamsService.getTableParams();
            uploadRequestEntriesVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
            uploadRequestEntriesVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
          });
      });
  }

  function goBack() {
    if (uploadRequest.collective) {
      const status = _.findKey(
        UPLOAD_REQUESTS_STATE_STATUS_MAPPING,
        state => state.includes(uploadRequest.status)
      );

      return $state.go(`uploadRequestGroups.${status}`, { reload: true });
    }

    $state.go('uploadRequests', {
      uploadRequestGroupUuid: uploadRequestGroup.uuid
    }, { reload: true });
  }

  function toggleSearchState() {
    if (!uploadRequestEntriesVm.searchMobileDropdown) {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').trigger('focus');
    } else {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }
    uploadRequestEntriesVm.searchMobileDropdown = !uploadRequestEntriesVm.searchMobileDropdown;
  }

  function getBackgroundContent() {
    const content = {
      title: 'UPLOAD_REQUESTS.TABLE.BACKGROUND_CONTENT.ENTRY_LIST.TITLE',
      message: 'UPLOAD_REQUESTS.TABLE.BACKGROUND_CONTENT.ENTRY_LIST.MESSAGE'
    };

    if (uploadRequest.status === 'CREATED') {
      content.title = 'UPLOAD_REQUESTS.TABLE.BACKGROUND_CONTENT.ENTRY_LIST_PENDING.TITLE';
      content.message = 'UPLOAD_REQUESTS.TABLE.BACKGROUND_CONTENT.ENTRY_LIST_PENDING.MESSAGE';
    }

    if (uploadRequest.status === 'ARCHIVED') {
      content.title = 'UPLOAD_REQUESTS.TABLE.BACKGROUND_CONTENT.ENTRY_LIST_ARCHIVED.TITLE';
      content.message = 'UPLOAD_REQUESTS.TABLE.BACKGROUND_CONTENT.ENTRY_LIST_ARCHIVED.MESSAGE';
    }

    return content;
  }
}

