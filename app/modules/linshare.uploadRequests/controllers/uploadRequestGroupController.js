angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupController', uploadRequestGroupController);

uploadRequestGroupController.$inject = [
  '_',
  '$state',
  'tableParamsService',
  'uploadRequestGroup',
  'uploadRequestGroupRestService',
  'UPLOAD_REQUESTS_STATE_STATUS_MAPPING'
];


function uploadRequestGroupController(
  _,
  $state,
  tableParamsService,
  uploadRequestGroup,
  uploadRequestGroupRestService,
  UPLOAD_REQUESTS_STATE_STATUS_MAPPING
) {
  const uploadRequestGroupVm = this;

  uploadRequestGroupVm.$onInit = onInit;
  uploadRequestGroupVm.goBack = goBack;
  uploadRequestGroupVm.uploadRequestGroup = uploadRequestGroup;
  uploadRequestGroupVm.allSelectedHasStatusOf = allSelectedHasStatusOf;
  uploadRequestGroupVm.paramFilter = { recipientEmail: '' };
  uploadRequestGroupVm.fabButton = {
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
    return uploadRequestGroupRestService.listUploadRequests(uploadRequestGroup.uuid)
      .then(uploadRequests => {
        uploadRequestGroupVm.itemsList = uploadRequests.map(request => {
          request.recipientEmail = request.recipients[0].mail;

          return request;
        });

        tableParamsService.initTableParams(uploadRequestGroupVm.itemsList, uploadRequestGroupVm.paramFilter)
          .then(() => {
            uploadRequestGroupVm.currentSelectedUploadRequest = {};
            uploadRequestGroupVm.tableParamsService = tableParamsService;
            uploadRequestGroupVm.resetSelectedUploadRequests = tableParamsService.resetSelectedItems;
            uploadRequestGroupVm.selectUploadRequestsOnCurrentPage = tableParamsService.tableSelectAll;
            uploadRequestGroupVm.addSelectedUploadRequest = tableParamsService.toggleItemSelection;
            uploadRequestGroupVm.sortDropdownSetActive = tableParamsService.tableSort;
            uploadRequestGroupVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
            uploadRequestGroupVm.toggleSearchState = toggleSearchState;
            uploadRequestGroupVm.selectedUploadRequests = tableParamsService.getSelectedItemsList();
            uploadRequestGroupVm.tableParams = tableParamsService.getTableParams();
            uploadRequestGroupVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
            uploadRequestGroupVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
          });
      });
  }

  function goBack() {
    const status = _.findKey(
      UPLOAD_REQUESTS_STATE_STATUS_MAPPING,
      state => state.includes(uploadRequestGroup.status)
    );

    $state.go('uploadRequestGroups', { status });
  }

  function toggleSearchState() {
    if (!uploadRequestGroupVm.searchMobileDropdown) {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').trigger('focus');
    } else {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }
    uploadRequestGroupVm.searchMobileDropdown = !uploadRequestGroupVm.searchMobileDropdown;
  }

  function allSelectedHasStatusOf(status) {
    return uploadRequestGroupVm.selectedUploadRequests &&
      uploadRequestGroupVm.selectedUploadRequests.every(uploadRequest => uploadRequest.status === status);
  }
}

