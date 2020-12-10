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
  'toastService',
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
  toastService,
  tableParamsService,
  UploadRequestGroupObjectService,
  uploadRequestGroups,
  uploadRequestGroupRestService,
  uploadRequestUtilsService,
  sidebarService
) {
  const uploadRequestGroupsVm = this;
  const { openWarningDialogFor, showToastAlertFor, archiveConfirmOptionDialog } = uploadRequestUtilsService;

  uploadRequestGroupsVm.$onInit = onInit;

  function onInit() {
    uploadRequestGroupsVm.loadSidebarContent = loadSidebarContent;
    uploadRequestGroupsVm.showDetails = showDetails;
    uploadRequestGroupsVm.openAddingRecipientsSideBar = openAddingRecipientsSideBar;
    uploadRequestGroupsVm.cancelUploadRequestGroups = cancelUploadRequestGroups;
    uploadRequestGroupsVm.closeUploadRequestGroups = closeUploadRequestGroups;
    uploadRequestGroupsVm.archiveUploadRequestGroup = archiveUploadRequestGroup;
    uploadRequestGroupsVm.uploadRequestGroupCreate = lsAppConfig.uploadRequestGroupCreate;
    uploadRequestGroupsVm.uploadRequestGroupDetails = lsAppConfig.uploadRequestGroupDetails;
    uploadRequestGroupsVm.getOwnerName = contactsListsService.getOwnerName;
    uploadRequestGroupsVm.setSubmitted = setSubmitted;
    uploadRequestGroupsVm.createUploadRequestGroup = createUploadRequestGroup;
    uploadRequestGroupsVm.updateUploadRequestGroup = updateUploadRequestGroup;
    uploadRequestGroupsVm.downloadEntries = downloadEntries;
    uploadRequestGroupsVm.currentStateName = $state.current.name;
    uploadRequestGroupsVm.paramFilter = { label: '' };
    uploadRequestGroupsVm.toggleSearchState = toggleSearchState;
    uploadRequestGroupsVm.currentSelectedDocument = {};
    uploadRequestGroupsVm.openUploadRequestGroup = openUploadRequestGroup;
    uploadRequestGroupsVm.removeArchivedUploadRequestGroups = removeArchivedUploadRequestGroups;
    uploadRequestGroupsVm.itemsList = uploadRequestGroups;
    uploadRequestGroupsVm.formTabIndex = 0;
    uploadRequestGroupsVm.selectedIndex = 0;
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
  }

  /**
   *  @name createUploadRequestGroup
   *  @desc Valid the object and call the method save on object UploadRequest
   *  @param {Object} form - An Object representing the form
   *  @param {Object} newUploadRequest - An object containing all informations of the uploadRequest
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function createUploadRequestGroup(form, newUploadRequest) {
    if (handleErrors(uploadRequestGroupsVm.uploadRequestGroupObject)) {
      return;
    }

    if (!form.$valid) {
      uploadRequestGroupsVm.setSubmitted(form);
      toastService.error({ key: 'UPLOAD_REQUESTS.FORM_CREATE.FORM_INVALID'});
    } else {
      newUploadRequest.create().then(request => {
        $scope.mainVm.sidebar.hide(newUploadRequest);
        toastService.success({key: 'UPLOAD_REQUESTS.FORM_CREATE.SUCCESS'});

        if (
          uploadRequestGroupsVm.currentStateName === 'uploadRequestGroups.pending' && request.status === 'CREATED' ||
          uploadRequestGroupsVm.currentStateName === 'uploadRequestGroups.activeClosed' && request.status === 'ENABLED'
        ) {
          uploadRequestGroupsVm.itemsList.push(request);
          uploadRequestGroupsVm.tableParams.reload();
        }

        $state.go(`uploadRequestGroups.${request.status === 'CREATED' ? 'pending' : 'activeClosed'}`);
      });
    }
  }

  /**
   *  @name updateUploadRequestGroup
   *  @desc Valid the object and call the method save on object UploadRequest
   *  @param {Object} form - An Object representing the form
   *  @param {Object} newUploadRequest - An object containing all informations of the uploadRequest
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function updateUploadRequestGroup(form, newUploadRequest) {
    if (!form.$valid) {
      uploadRequestGroupsVm.setSubmitted(form);
      toastService.error({ key: 'UPLOAD_REQUESTS.FORM_CREATE.FORM_INVALID'});
    } else {
      newUploadRequest.update()
        .then(request => {
          sidebarService.hide();
          uploadRequestGroupsVm.itemsList = uploadRequestGroupsVm.itemsList.map(item =>
            item.uuid === request.uuid ? Object.assign(item, request) : item);
          uploadRequestGroupsVm.tableParams.reload();
          showToastAlertFor('update', 'info', []);
        })
        .catch(error => {
          if (error) {
            showToastAlertFor('update', 'error');
          }
        });
    }
  }

  /**
   *  @name setSubmitted
   *  @desc Set a form & subform to the state 'submitted'
   *  @param {DOM Object} form - The form to set to submitted state
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function setSubmitted(form) {
    form.$setSubmitted();
    angular.forEach(form, function(item) {
      if (item && item.$$parentForm === form && item.$setSubmitted) {
        setSubmitted(item);
      }
    });
  }

  /**
   *  @name handleErrors
   *  @desc handle custom validation errors
   *  @param {Object} uploadRequestGroupObject - Object contains data of upload requests
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function handleErrors(uploadRequestGroupObject) {
    if (uploadRequestGroupObject.getNewRecipients().length === 0) {
      toastService.error({key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT_UPLOAD_REQUEST'});

      return true;
    }
  }

  /**
   *  @name showDetails
   *  @desc open sidebar tabs to show detail information of upload request
   *  @param {Object} uploadRequest - Object contains data of upload requests
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function showDetails(uploadRequest = {}, { formTabIndex = 0, selectedIndex = 0 } = {}) {
    $q.all([
      uploadRequestGroupRestService.get(uploadRequest.uuid),
      uploadRequestGroupRestService.listUploadRequests(uploadRequest.uuid)
    ]).then(([uploadRequestGroup, uploadRequests]) => {
      uploadRequestGroupsVm.currentSelected = uploadRequestGroup;
      uploadRequestGroupsVm.currentSelected.recipients = [];

      uploadRequests.forEach(uploadRequest => {
        uploadRequestGroupsVm.currentSelected.recipients.push(...uploadRequest.recipients.map(recipient => recipient.mail));
      });

      uploadRequestGroupsVm.formTabIndex = formTabIndex >= 0 ? formTabIndex : uploadRequestGroupsVm.formTabIndex;
      uploadRequestGroupsVm.selectedIndex = selectedIndex >= 0 ? selectedIndex : uploadRequestGroupsVm.selectedIndex;

      loadSidebarContent(uploadRequestGroupsVm.uploadRequestGroupDetails, true, uploadRequestGroupsVm.currentSelected);
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

        uploadRequestGroupsVm.currentSelectedUploadRequest = uploadRequest;
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
          const isFound = closedRequests.find(request => request.uuid === item.uuid);

          if (isFound) {
            uploadRequestGroupsVm.itemsList[index].status = 'CLOSED';
          }
        });

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

  function archiveUploadRequestGroup(uploadRequestGroup) {
    openWarningDialogFor('archive', uploadRequestGroup)
      .then(isConfirmed => isConfirmed ? archiveConfirmOptionDialog() : $q.reject())
      .then(isCopied => uploadRequestGroupRestService.updateStatus(uploadRequestGroup.uuid, 'ARCHIVED', {copy: !!isCopied }))
      .then(archivedRequest => {
        _.remove(uploadRequestGroupsVm.itemsList, item => archivedRequest.uuid === item.uuid);
        _.remove(uploadRequestGroupsVm.selectedUploadRequestGroups, selected => archivedRequest.uuid === selected.uuid);

        uploadRequestGroupsVm.tableParams.reload();

        showToastAlertFor('archive', 'info', [archivedRequest]);
      }).catch(err => {
        if (err) {
          showToastAlertFor('archive', 'error');
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

    uploadRequestGroupsVm.formTabIndex = 0;
    uploadRequestGroupsVm.selectedIndex = 0;
  }

  function downloadEntries(uploadRequestGroup) {
    const url = uploadRequestGroupRestService.getDownloadEntriesUrl(uploadRequestGroup.uuid);

    documentUtilsService.download(url, uploadRequestGroup.label);
  }
}
