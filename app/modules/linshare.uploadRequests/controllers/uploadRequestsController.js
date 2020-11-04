angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestsController', uploadRequestsController);

uploadRequestsController.$inject = [
  '_',
  '$state',
  'tableParamsService',
  'uploadRequestGroup',
  'uploadRequestGroupRestService',
  'UPLOAD_REQUESTS_STATE_STATUS_MAPPING'
];


function uploadRequestsController(
  _,
  $state,
  tableParamsService,
  uploadRequestGroup,
  uploadRequestGroupRestService,
  UPLOAD_REQUESTS_STATE_STATUS_MAPPING
) {
  const uploadRequestsVm = this;

  uploadRequestsVm.$onInit = onInit;
  uploadRequestsVm.goBack = goBack;
  uploadRequestsVm.uploadRequestGroup = uploadRequestGroup;
  uploadRequestsVm.openUploadRequest = openUploadRequest;
  uploadRequestsVm.allSelectedHasStatusOf = allSelectedHasStatusOf;
  uploadRequestsVm.paramFilter = { recipientEmail: '' };
  uploadRequestsVm.fabButton = {
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
        if (uploadRequestGroup.collective) {
          return $state.go('uploadRequestEntries', {
            uploadRequestUuid: uploadRequests[0].uuid
          });
        }

        uploadRequestsVm.itemsList = uploadRequests.map(request => {
          request.recipientEmail = request.recipients[0].mail;

          return request;
        });

        tableParamsService.initTableParams(uploadRequestsVm.itemsList, uploadRequestsVm.paramFilter)
          .then(() => {
            uploadRequestsVm.currentSelectedUploadRequest = {};
            uploadRequestsVm.tableParamsService = tableParamsService;
            uploadRequestsVm.resetSelectedUploadRequests = tableParamsService.resetSelectedItems;
            uploadRequestsVm.selectUploadRequestsOnCurrentPage = tableParamsService.tableSelectAll;
            uploadRequestsVm.addSelectedUploadRequest = tableParamsService.toggleItemSelection;
            uploadRequestsVm.sortDropdownSetActive = tableParamsService.tableSort;
            uploadRequestsVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
            uploadRequestsVm.toggleSearchState = toggleSearchState;
            uploadRequestsVm.selectedUploadRequests = tableParamsService.getSelectedItemsList();
            uploadRequestsVm.tableParams = tableParamsService.getTableParams();
            uploadRequestsVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
            uploadRequestsVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
          });
      });
  }

  function goBack() {
    const status = _.findKey(
      UPLOAD_REQUESTS_STATE_STATUS_MAPPING,
      state => state.includes(uploadRequestGroup.status)
    );

    $state.go(`uploadRequestGroups.${status}`, { reload: true });
  }

  function toggleSearchState() {
    if (!uploadRequestsVm.searchMobileDropdown) {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').trigger('focus');
    } else {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }
    uploadRequestsVm.searchMobileDropdown = !uploadRequestsVm.searchMobileDropdown;
  }

  function allSelectedHasStatusOf(status) {
    return uploadRequestsVm.selectedUploadRequests &&
      uploadRequestsVm.selectedUploadRequests.every(uploadRequest => uploadRequest.status === status);
  }

  function openUploadRequest(uploadRequest) {
    $state.go('uploadRequestEntries', { uploadRequestUuid: uploadRequest.uuid });
  }
}

