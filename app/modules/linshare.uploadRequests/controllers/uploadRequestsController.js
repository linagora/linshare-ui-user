angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestsController', uploadRequestsController);

uploadRequestsController.$inject = [
  '_',
  '$q',
  '$log',
  '$state',
  'lsAppConfig',
  'tableParamsService',
  'documentUtilsService',
  'uploadRequestGroup',
  'UploadRequestObjectService',
  'uploadRequestGroupRestService',
  'uploadRequestRestService',
  'UPLOAD_REQUESTS_STATE_STATUS_MAPPING',
  'sidebarService',
  'uploadRequestUtilsService',
  'UploadRequestGroupObjectService'
];


function uploadRequestsController(
  _,
  $q,
  $log,
  $state,
  lsAppConfig,
  tableParamsService,
  documentUtilsService,
  uploadRequestGroup,
  UploadRequestObjectService,
  uploadRequestGroupRestService,
  uploadRequestRestService,
  UPLOAD_REQUESTS_STATE_STATUS_MAPPING,
  sidebarService,
  uploadRequestUtilsService,
  UploadRequestGroupObjectService
) {
  const uploadRequestsVm = this;
  const { openWarningDialogFor, showToastAlertFor, openAddingRecipientsSideBar } = uploadRequestUtilsService;
  const filterDeletedUploadRequest = uploadRequests => uploadRequests.filter(request => request.status !== 'DELETED');

  uploadRequestsVm.$onInit = onInit;
  uploadRequestsVm.goBack = goBack;
  uploadRequestsVm.uploadRequestGroup = uploadRequestGroup;
  uploadRequestsVm.openUploadRequest = openUploadRequest;
  uploadRequestsVm.allSelectedHasStatusOf = allSelectedHasStatusOf;
  uploadRequestsVm.addRecipients = addRecipients;
  uploadRequestsVm.showDetails = showDetails;
  uploadRequestsVm.onUpdateSuccess = onUpdateSuccess;
  uploadRequestsVm.showUploadRequestGroupDetails = showUploadRequestGroupDetails;
  uploadRequestsVm.paramFilter = { recipientEmail: '' };
  uploadRequestsVm.selectedIndex = 0;
  uploadRequestsVm.fabButton = {
    toolbar: {
      activate: true,
      label: 'UPLOAD_REQUESTS.TITLE_SINGULAR'
    },
    actions: [
      {
        label: 'UPLOAD_REQUESTS.TABLE.OPTIONS.ADD_RECIPIENTS',
        icon: 'ls-add-user-sm',
        action: addRecipients
      }
    ]
  };

  function onInit() {
    return uploadRequestGroupRestService.listUploadRequests(uploadRequestGroup.uuid)
      .then(filterDeletedUploadRequest)
      .then(uploadRequests => {
        if (uploadRequestGroup.collective) {
          return $state.go('uploadRequestEntries', {
            uploadRequestUuid: uploadRequests[0].uuid
          });
        }

        uploadRequestsVm.itemsList = uploadRequests.map(request => {
          request.recipientEmail = request.recipients[0].mail;

          return request;
        }).filter(request => request.status !== 'CANCELED');

        tableParamsService.initTableParams(uploadRequestsVm.itemsList, uploadRequestsVm.paramFilter)
          .then(() => {
            uploadRequestsVm.currentSelectedUploadRequest = {};
            uploadRequestsVm.tableParamsService = tableParamsService;
            uploadRequestsVm.resetSelectedUploadRequests = tableParamsService.resetSelectedItems;
            uploadRequestsVm.selectUploadRequestsOnCurrentPage = tableParamsService.tableSelectAll;
            uploadRequestsVm.toggleUploadRequestSelection = tableParamsService.toggleItemSelection;
            uploadRequestsVm.sortDropdownSetActive = tableParamsService.tableSort;
            uploadRequestsVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
            uploadRequestsVm.toggleSearchState = toggleSearchState;
            uploadRequestsVm.cancelUploadRequests = cancelUploadRequests;
            uploadRequestsVm.closeUploadRequests = closeUploadRequests;
            uploadRequestsVm.archiveUploadRequest = archiveUploadRequest;
            uploadRequestsVm.downloadEntries = downloadEntries;
            uploadRequestsVm.removeArchivedUploadRequests = removeArchivedUploadRequests;
            uploadRequestsVm.selectedUploadRequests = tableParamsService.getSelectedItemsList();
            uploadRequestsVm.tableParams = tableParamsService.getTableParams();
            uploadRequestsVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
            uploadRequestsVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
            uploadRequestsVm.cancelOrCloseSelected = () => {
              if (allSelectedHasStatusOf('CREATED')) {
                return cancelUploadRequests(uploadRequestsVm.selectedUploadRequests);
              }

              if (allSelectedHasStatusOf('ENABLED')) {
                return closeUploadRequests(uploadRequestsVm.selectedUploadRequests);
              }
            };
          });
      });
  }

  function reset() {
    return uploadRequestGroupRestService.listUploadRequests(uploadRequestGroup.uuid)
      .then(filterDeletedUploadRequest)
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

        tableParamsService.reloadTableParams(uploadRequestsVm.itemsList);
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

  function cancelUploadRequests(uploadRequests) {
    openWarningDialogFor('cancellation', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(request => uploadRequestRestService.updateStatus(request.uuid, 'CANCELED'))
      ))
      .then(promises => {
        const canceledRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notCanceledRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(promise => promise.reason);

        removeFromSelected(canceledRequests);
        updateUploadRequestStatuses(canceledRequests, 'CANCELED');
        _.remove(uploadRequestsVm.itemsList, item => canceledRequests.some(request => request.uuid === item.uuid));
        uploadRequestsVm.tableParams.reload();

        if (notCanceledRequests.length) {
          showToastAlertFor('cancellation', 'error', notCanceledRequests);
        } else {
          showToastAlertFor('cancellation', 'info', canceledRequests);
        }
      });
  }

  function closeUploadRequests(uploadRequests) {
    openWarningDialogFor('close', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(
          request => uploadRequestRestService.updateStatus(request.uuid, 'CLOSED')
        )
      ))
      .then(promises => {
        const closedRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notClosedRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(promise => promise.reason);

        removeFromSelected(closedRequests);
        updateUploadRequestStatuses(closedRequests, 'CLOSED');

        if (notClosedRequests.length) {
          showToastAlertFor('close', 'error', notClosedRequests);
        } else {
          showToastAlertFor('close', 'info', closedRequests);
        }
      });
  }

  function archiveUploadRequest(uploadRequest) {
    openWarningDialogFor('archive', uploadRequest)
      .then(isCopied => uploadRequestRestService.updateStatus(uploadRequest.uuid, 'ARCHIVED', {copy: !!isCopied }))
      .then(archivedRequest => {
        removeFromSelected([archivedRequest]);
        updateUploadRequestStatuses([archivedRequest], 'ARCHIVED');
        showToastAlertFor('archive', 'info', [archivedRequest]);
      }).catch(err => {
        if (err) {
          showToastAlertFor('archive', 'error');
        }
      });
  }

  function removeArchivedUploadRequests(uploadRequests) {
    openWarningDialogFor('delete_archived', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(request => uploadRequestRestService.updateStatus(request.uuid, 'DELETED'))
      ))
      .then(promises => {
        const removedRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notRemovedRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(reject => reject.reason);

        _.remove(uploadRequestsVm.itemsList, item => removedRequests.some(request => request.uuid === item.uuid));
        _.remove(uploadRequestsVm.selectedUploadRequests, selected => removedRequests.some(request => request.uuid === selected.uuid));

        uploadRequestsVm.tableParams.reload();

        if (notRemovedRequests.length) {
          showToastAlertFor('delete_archived', 'error', notRemovedRequests);
        } else {
          showToastAlertFor('delete_archived', 'info', removedRequests);
        }
      })
      .catch(error => {
        if (error) { $log.error(error); }
      });
  }

  function updateUploadRequestStatuses(updated, status) {
    uploadRequestsVm.itemsList.forEach((item, index) => {
      const isFound = updated.find(request => request.uuid === item.uuid);

      if (isFound) {
        uploadRequestsVm.itemsList[index].status = status;
      }
    });
  }

  function removeFromSelected(list) {
    list.forEach(uploadRequest => {
      const target = uploadRequestsVm.selectedUploadRequests.find(selected => selected.uuid === uploadRequest.uuid);

      if (target) {
        uploadRequestsVm.toggleUploadRequestSelection(target);
      }
    });
  }

  function showDetails(uploadRequest, { selectedIndex = 0 } = {}) {
    uploadRequestRestService.get(uploadRequest.uuid).then(responseUploadRequest => {
      uploadRequestsVm.currentSelected = uploadRequest;
      uploadRequestsVm.selectedIndex = selectedIndex;
      uploadRequestsVm.uploadRequestObject = new UploadRequestObjectService(responseUploadRequest);

      sidebarService.setData(uploadRequestsVm);
      sidebarService.setContent(lsAppConfig.uploadRequestDetails);
      sidebarService.show();
    });
  }

  function addRecipients() {
    const uploadRequestObject = new UploadRequestGroupObjectService({
      ...uploadRequestsVm.uploadRequestGroup,
      recipients: uploadRequestsVm.itemsList.map(item => item.recipients && item.recipients[0]).filter(Boolean)
    }, {
      submitRecipientsCallback: () => {
        reset();
        sidebarService.hide();
      }
    });

    openAddingRecipientsSideBar(uploadRequestObject);
  }

  function onUpdateSuccess(updated) {
    const itemIndex = uploadRequestsVm.itemsList.findIndex(item => item.uuid === updated.uuid);

    if (itemIndex >= 0) {
      uploadRequestsVm.itemsList[itemIndex] = _.assign(uploadRequestsVm.itemsList[itemIndex], updated);
    }

    uploadRequestsVm.tableParams.reload();
    sidebarService.hide();
  }

  function downloadEntries(uploadRequest) {
    const url = uploadRequestGroupRestService.getDownloadEntriesUrl(uploadRequestGroup.uuid, uploadRequest.uuid);

    documentUtilsService.download(url, uploadRequestGroup.label);
  }

  function showUploadRequestGroupDetails() {
    $q.all([
      uploadRequestGroupRestService.get(uploadRequestGroup.uuid),
      uploadRequestGroupRestService.listUploadRequests(uploadRequestGroup.uuid),
    ]).then(([uploadRequestGroup, uploadRequests]) => {
      const recipients = [];

      uploadRequests.forEach(uploadRequest => recipients.push(...uploadRequest.recipients.map(recipient => recipient.mail)));

      sidebarService.setData({
        uploadRequestGroupObject: new UploadRequestGroupObjectService({...uploadRequestGroup, recipients}),
        onUpdateSuccess() {
          sidebarService.hide();
          $state.reload();
        }
      });
      sidebarService.setContent(lsAppConfig.uploadRequestGroupDetails);
      sidebarService.show();
    });
  }
}
