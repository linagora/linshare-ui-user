/**
 * uploadRequestGroupsController Controller
 * @namespace UploadRequests
 * @memberOf LinShare
 */

angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupsController', uploadRequestGroupsController);

uploadRequestGroupsController.$inject = [
  '_',
  '$q',
  '$scope',
  '$state',
  'contactsListsService',
  'documentUtilsService',
  'lsAppConfig',
  'tableParamsService',
  'UploadRequestGroupObjectService',
  'uploadRequestGroups',
  'uploadRequestGroupRestService',
  'uploadRequestUtilsService',
  'sidebarService'
];

/**
 * @namespace uploadRequestGroupsController
 * @desc Application upload request management system controller
 * @memberOf LinShare.UploadRequests.uploadRequestGroupsController
 */
function uploadRequestGroupsController(
  _,
  $q,
  $scope,
  $state,
  contactsListsService,
  documentUtilsService,
  lsAppConfig,
  tableParamsService,
  UploadRequestGroupObjectService,
  uploadRequestGroups,
  uploadRequestGroupRestService,
  uploadRequestUtilsService,
  sidebarService
) {
  const uploadRequestGroupsVm = this;
  const { openWarningDialogFor, showToastAlertFor } = uploadRequestUtilsService;

  uploadRequestGroupsVm.$onInit = onInit;

  function onInit() {
    uploadRequestGroupsVm.loadSidebarContent = loadSidebarContent;
    uploadRequestGroupsVm.showDetails = showDetails;
    uploadRequestGroupsVm.openAddingRecipientsSideBar = openAddingRecipientsSideBar;
    uploadRequestGroupsVm.cancelUploadRequestGroups = cancelUploadRequestGroups;
    uploadRequestGroupsVm.closeUploadRequestGroups = closeUploadRequestGroups;
    uploadRequestGroupsVm.archiveUploadRequestGroups = archiveUploadRequestGroups;
    uploadRequestGroupsVm.uploadRequestGroupCreate = lsAppConfig.uploadRequestGroupCreate;
    uploadRequestGroupsVm.uploadRequestGroupDetails = lsAppConfig.uploadRequestGroupDetails;
    uploadRequestGroupsVm.getOwnerName = contactsListsService.getOwnerName;
    uploadRequestGroupsVm.onCreateSuccess = onCreateSuccess;
    uploadRequestGroupsVm.onUpdateSuccess = onUpdateSuccess;
    uploadRequestGroupsVm.downloadEntries = downloadEntries;
    uploadRequestGroupsVm.currentStateName = $state.current.name;
    uploadRequestGroupsVm.paramFilter = { label: '' };
    uploadRequestGroupsVm.toggleSearchState = toggleSearchState;
    uploadRequestGroupsVm.currentSelectedDocument = {};
    uploadRequestGroupsVm.openUploadRequestGroup = openUploadRequestGroup;
    uploadRequestGroupsVm.removeArchivedUploadRequestGroups = removeArchivedUploadRequestGroups;
    uploadRequestGroupsVm.itemsList = uploadRequestGroups;
    uploadRequestGroupsVm.selectedIndex = 0;
    uploadRequestGroupsVm.displayAdvancedOptions = false;
    uploadRequestGroupsVm.reset = reset;
    uploadRequestGroupsVm.fabButton = {
      toolbar: {
        activate: true,
        label: 'UPLOAD_REQUESTS.TITLE'
      },
      actions: [
        {
          action: () => uploadRequestGroupsVm.loadSidebarContent(uploadRequestGroupsVm.uploadRequestGroupCreate, true),
          label: 'UPLOAD_REQUESTS.CREATION_TYPE.COLLECTIVE',
          icon: 'ls-upload-request-alt',
        },
        {
          action: () => uploadRequestGroupsVm.loadSidebarContent(uploadRequestGroupsVm.uploadRequestGroupCreate, false),
          label: 'UPLOAD_REQUESTS.CREATION_TYPE.INDIVIDUAL',
          icon: 'ls-upload-request-2',
        }
      ]
    };

    return tableParamsService.initTableParams(uploadRequestGroupsVm.itemsList, uploadRequestGroupsVm.paramFilter)
      .then(() => {
        uploadRequestGroupsVm.tableParamsService = tableParamsService;
        uploadRequestGroupsVm.resetSelectedUploadRequestGroups = tableParamsService.resetSelectedItems;
        uploadRequestGroupsVm.selectUploadRequestGroupsOnCurrentPage = tableParamsService.tableSelectAll;
        uploadRequestGroupsVm.addSelectedUploadRequestGroup = tableParamsService.toggleItemSelection;
        uploadRequestGroupsVm.sortDropdownSetActive = tableParamsService.tableSort;
        uploadRequestGroupsVm.toggleFilterBySelectedItems = tableParamsService.isolateSelection;
        uploadRequestGroupsVm.selectedUploadRequestGroups = tableParamsService.getSelectedItemsList();
        uploadRequestGroupsVm.tableParams = tableParamsService.getTableParams();
        uploadRequestGroupsVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
        uploadRequestGroupsVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
        uploadRequestGroupsVm.canCloseSelectedUploadRequests = () => uploadRequestGroupsVm.selectedUploadRequestGroups.every(request => request.status === 'ENABLED');
        uploadRequestGroupsVm.canArchiveSelectedUploadRequests = () => uploadRequestGroupsVm.selectedUploadRequestGroups.every(request => request.status === 'CLOSED');
      });
  }

  /**
   * @name loadSidebarContent
   * @desc Update the content of the sidebar
   * @param {String} content - The id of the content to load
   *                           See app/views/includes/sidebar-right.html for possible values
   * @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function loadSidebarContent(content, collective, uploadRequestGroupObject) {
    uploadRequestGroupsVm.collective = collective;
    uploadRequestGroupsVm.uploadRequestGroupObject = new UploadRequestGroupObjectService( uploadRequestGroupObject || { collective });
    $scope.mainVm.sidebar.setData(uploadRequestGroupsVm);
    $scope.mainVm.sidebar.setContent(content || lsAppConfig.uploadRequestGroupCreate);
    $scope.mainVm.sidebar.show();

    // Make tooltips disappear after showing sidebar
    $('.upload-request-tooltip-trigger').trigger('mouseleave');
  }

  /**
   *  @name showDetails
   *  @desc open sidebar tabs to show detail information of upload request
   *  @param {Object} uploadRequest - Object contains data of upload requests
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function showDetails(uploadRequest = {}, { selectedIndex = 0 } = {}) {
    uploadRequestGroupsVm.currentSelectedDocument.current = uploadRequest;

    $q.all([
      uploadRequestGroupRestService.get(uploadRequest.uuid),
      uploadRequestGroupRestService.listUploadRequests(uploadRequest.uuid),
    ]).then(([uploadRequestGroup, uploadRequests]) => {
      uploadRequestGroup.recipients = [];
      uploadRequestGroup.nbrUploadedFiles = 0;

      uploadRequests.forEach(request => {
        uploadRequestGroup.recipients.push(...request.recipients.map(recipient => recipient.mail));
        uploadRequestGroup.nbrUploadedFiles += request.nbrUploadedFiles;
      });
      uploadRequestGroupsVm.selectedIndex = selectedIndex >= 0 ? selectedIndex : uploadRequestGroupsVm.selectedIndex;
      loadSidebarContent(uploadRequestGroupsVm.uploadRequestGroupDetails, true, uploadRequestGroup);
    });
  }

  function openAddingRecipientsSideBar(uploadRequest = {}) {
    uploadRequest.recipients = [];

    uploadRequestGroupRestService.listUploadRequests(uploadRequest.uuid)
      .then(uploadRequests => uploadRequests.forEach(item => uploadRequest.recipients.push(...item.recipients)))
      .then(() => {
        const uploadRequestObject = new UploadRequestGroupObjectService(uploadRequest, {
          submitRecipientsCallback: () => {
            sidebarService.hide();
          }
        });

        uploadRequestGroupsVm.currentSelectedDocument.current = uploadRequest;
        uploadRequestUtilsService.openAddingRecipientsSideBar(uploadRequestObject);
      });
  }

  function toggleSearchState() {
    if (!uploadRequestGroupsVm.searchMobileDropdown) {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    } else {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }
    uploadRequestGroupsVm.searchMobileDropdown = !uploadRequestGroupsVm.searchMobileDropdown;
  }

  function cancelUploadRequestGroups(uploadRequests) {
    openWarningDialogFor('cancellation', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(
          request => uploadRequestGroupRestService.updateStatus(request.uuid, 'CANCELED')
        )
      ))
      .then(promises => {
        const canceledRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notCanceledRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(reject => reject.reason);

        _.remove(uploadRequestGroupsVm.itemsList, item => canceledRequests.some(request => request.uuid === item.uuid));
        _.remove(uploadRequestGroupsVm.selectedUploadRequestGroups, selected => canceledRequests.some(request => request.uuid === selected.uuid));

        if (canceledRequests.includes(
          request => uploadRequestGroupsVm.currentSelectedDocument.current && uploadRequestGroupsVm.currentSelectedDocument.current.uuid === request.uuid)
        ) {
          sidebarService.hide();
        }

        uploadRequestGroupsVm.tableParams.reload();

        return {
          canceledRequests,
          notCanceledRequests
        };
      })
      .then(({ canceledRequests, notCanceledRequests}) => {
        if (notCanceledRequests.length) {
          showToastAlertFor('cancellation', 'error', notCanceledRequests);
        } else {
          showToastAlertFor('cancellation', 'info', canceledRequests);
        }
      });
  }

  function closeUploadRequestGroups(uploadRequests) {
    openWarningDialogFor('close', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(
          request => uploadRequestGroupRestService.updateStatus(request.uuid, 'CLOSED')
        )
      ))
      .then(promises => {
        const closedRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notClosedRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(reject => reject.reason);

        uploadRequestGroupsVm.itemsList.forEach((item, index) => {
          const updated = closedRequests.find(request => request.uuid === item.uuid);

          if (updated) {
            uploadRequestGroupsVm.itemsList[index].status = 'CLOSED';
          }

          if (
            updated &&
            uploadRequestGroupsVm.currentSelectedDocument.current &&
            uploadRequestGroupsVm.currentSelectedDocument.current.uuid === item.uuid
          ) {
            sidebarService.hide();
          }
        });

        removeFromSelected(closedRequests);

        uploadRequestGroupsVm.tableParams.reload();

        return {
          closedRequests,
          notClosedRequests
        };
      })
      .then(({ closedRequests, notClosedRequests}) => {
        if (notClosedRequests.length) {
          showToastAlertFor('close', 'error', notClosedRequests);
        } else {
          showToastAlertFor('close', 'info', closedRequests);
        }
      })
      .catch(err => {
        if (err) {
          showToastAlertFor('unexpected_error');
        }
      });
  }

  function archiveUploadRequestGroups(uploadRequestGroups) {
    openWarningDialogFor('archive', uploadRequestGroups)
      .then(isCopied => $q.allSettled(uploadRequestGroups.map(
        uploadRequestGroup => uploadRequestGroupRestService.updateStatus(uploadRequestGroup.uuid, 'ARCHIVED', {copy: !!isCopied })
      )))
      .then(promises => {
        const archivedRequests = promises.filter(promise => promise.state === 'fulfilled').map(resolved => resolved.value);
        const notArchivedRequests = promises.filter(promise => promise.state === 'rejected').map(rejection => rejection.reason);

        if (archivedRequests.some(
          request => uploadRequestGroupsVm.currentSelectedDocument.current && request.uuid === uploadRequestGroupsVm.currentSelectedDocument.current.uuid)
        ) {
          sidebarService.hide();
        }

        _.remove(uploadRequestGroupsVm.itemsList, item => archivedRequests.some(request => request.uuid === item.uuid));
        _.remove(uploadRequestGroupsVm.selectedUploadRequestGroups, selected => archivedRequests.some(request => request.uuid === selected.uuid));

        uploadRequestGroupsVm.tableParams.reload();

        return {
          archivedRequests,
          notArchivedRequests
        };
      })
      .then(({ archivedRequests, notArchivedRequests }) => {
        if (notArchivedRequests.length) {
          showToastAlertFor('archive', 'error', notArchivedRequests);
        } else {
          showToastAlertFor('archive', 'info', archivedRequests);
        }
      });
  }

  function removeArchivedUploadRequestGroups(uploadRequestGroups) {
    openWarningDialogFor('delete_archived', uploadRequestGroups)
      .then(() => $q.allSettled(
        uploadRequestGroups.map(
          request => uploadRequestGroupRestService.updateStatus(request.uuid, 'DELETED')
        )
      ))
      .then(promises => {
        const removedRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notRemovedRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(reject => reject.reason);

        if (removedRequests.some(
          request => uploadRequestGroupsVm.currentSelectedDocument.current && request.uuid === uploadRequestGroupsVm.currentSelectedDocument.current.uuid)
        ) {
          sidebarService.hide();
        }

        _.remove(uploadRequestGroupsVm.itemsList, item => removedRequests.some(request => request.uuid === item.uuid));
        _.remove(uploadRequestGroupsVm.selectedUploadRequestGroups, selected => removedRequests.some(request => request.uuid === selected.uuid));

        uploadRequestGroupsVm.tableParams.reload();

        return {
          removedRequests,
          notRemovedRequests
        };
      })
      .then(({ removedRequests, notRemovedRequests }) => {
        if (notRemovedRequests.length) {
          showToastAlertFor('delete_archived', 'error', notRemovedRequests);
        } else {
          showToastAlertFor('delete_archived', 'info', removedRequests);
        }
      });
  }

  function openUploadRequestGroup(uploadRequestGroup) {
    if (uploadRequestGroup.collective) {
      return uploadRequestGroupRestService.listUploadRequests(uploadRequestGroup.uuid)
        .then(requests => {
          if (requests && requests.length === 1) {
            $state.go('uploadRequestEntries', {
              uploadRequestUuid: requests[0].uuid,
              uploadRequestGroupUuid: uploadRequestGroup.uuid
            }, { inherit: false });
          }
        });
    }

    $state.go('uploadRequests', { uploadRequestGroupUuid: uploadRequestGroup.uuid }, { inherit: false });
  }

  function reset() {
    if (uploadRequestGroupsVm.form) {
      uploadRequestGroupsVm.form.$setUntouched();
      uploadRequestGroupsVm.form.$setPristine();
    }

    uploadRequestGroupsVm.selectedIndex = 0;
  }

  function downloadEntries(uploadRequestGroup) {
    const url = uploadRequestGroupRestService.getDownloadEntriesUrl(uploadRequestGroup.uuid);

    documentUtilsService.download(url, uploadRequestGroup.label);
  }

  function onUpdateSuccess(updated) {
    sidebarService.hide();
    const itemIndex = uploadRequestGroupsVm.itemsList.findIndex(item => item.uuid === updated.uuid);

    if (itemIndex >= 0) {
      uploadRequestGroupsVm.itemsList[itemIndex] = _.assign(uploadRequestGroupsVm.itemsList[itemIndex], updated);
      uploadRequestGroupsVm.tableParams.reload();
    }
  }

  function onCreateSuccess(created) {
    sidebarService.hide();
    if (
      uploadRequestGroupsVm.currentStateName === 'uploadRequestGroups.pending' && created.status === 'CREATED' ||
      uploadRequestGroupsVm.currentStateName === 'uploadRequestGroups.activeClosed' && created.status === 'ENABLED'
    ) {
      uploadRequestGroupsVm.itemsList.push(created);
      uploadRequestGroupsVm.tableParams.reload();
    } else {
      $state.go(`uploadRequestGroups.${created.status === 'CREATED' ? 'pending' : 'activeClosed'}`);
    }
  }

  function removeFromSelected(list) {
    list.forEach(uploadRequest => {
      const target = uploadRequestGroupsVm.selectedUploadRequestGroups.find(selected => selected.uuid === uploadRequest.uuid);

      if (target) {
        tableParamsService.toggleItemSelection(target);
      }
    });

    if (uploadRequestGroupsVm.selectedUploadRequestGroups.length === 0) {
      tableParamsService.resetFlagsOnSelectedPages();
    }
  }
}
