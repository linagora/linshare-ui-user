angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestController', uploadRequestController);

uploadRequestController.$inject = [
  '_',
  '$state',
  'tableParamsService',
  'uploadRequest',
  'uploadRequestRestService',
  'UPLOAD_REQUESTS_STATE_STATUS_MAPPING'
];


function uploadRequestController(
  _,
  $state,
  tableParamsService,
  uploadRequest,
  uploadRequestRestService,
  UPLOAD_REQUESTS_STATE_STATUS_MAPPING
) {
  const uploadRequestVm = this;

  uploadRequestVm.$onInit = onInit;
  uploadRequestVm.goToUploadRequestGroups = goToUploadRequestGroups;
  uploadRequestVm.uploadRequest = uploadRequest;
  uploadRequestVm.isArchived = uploadRequest.status === 'ARCHIVED';
  uploadRequestVm.backgroundContent = getBackgroundContent();
  uploadRequestVm.paramFilter = { name: '' };
  uploadRequestVm.fabButton = {
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
        uploadRequestVm.itemsList = entries;

        tableParamsService.initTableParams(uploadRequestVm.itemsList, uploadRequestVm.paramFilter)
          .then(() => {
            uploadRequestVm.currentSelectedEntry = {};
            uploadRequestVm.tableParamsService = tableParamsService;
            uploadRequestVm.resetSelectedEntries = tableParamsService.resetSelectedItems;
            uploadRequestVm.selectEntriesOnCurrentPage = tableParamsService.tableSelectAll;
            uploadRequestVm.addSelectedEntry = tableParamsService.toggleItemSelection;
            uploadRequestVm.sortDropdownSetActive = tableParamsService.tableSort;
            uploadRequestVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
            uploadRequestVm.toggleSearchState = toggleSearchState;
            uploadRequestVm.selectedEntries = tableParamsService.getSelectedItemsList();
            uploadRequestVm.tableParams = tableParamsService.getTableParams();
            uploadRequestVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
            uploadRequestVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
          });
      });
  }

  function goToUploadRequestGroups() {
    const status = _.findKey(
      UPLOAD_REQUESTS_STATE_STATUS_MAPPING,
      state => state.includes(uploadRequest.status)
    );

    $state.go('uploadRequestGroups', { status });
  }

  function toggleSearchState() {
    if (!uploadRequestVm.searchMobileDropdown) {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').trigger('focus');
    } else {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }
    uploadRequestVm.searchMobileDropdown = !uploadRequestVm.searchMobileDropdown;
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

