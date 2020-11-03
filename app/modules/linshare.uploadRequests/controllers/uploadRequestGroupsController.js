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
  '$stateParams',
  'contactsListsService',
  'lsAppConfig',
  'toastService',
  'tableParamsService',
  'uploadRequestGroups',
  'UploadRequestObjectService',
  'uploadRequestGroupRestService',
  'uploadRequestUtilsService'
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
  $stateParams,
  contactsListsService,
  lsAppConfig,
  toastService,
  tableParamsService,
  uploadRequestGroups,
  UploadRequestObjectService,
  uploadRequestGroupRestService,
  uploadRequestUtilsService
) {
  const uploadRequestGroupsVm = this;
  const { openWarningDialogFor, showToastAlertFor, archiveConfirmOptionDialog } = uploadRequestUtilsService;

  uploadRequestGroupsVm.$onInit = onInit;

  function onInit() {
    uploadRequestGroupsVm.loadSidebarContent = loadSidebarContent;
    uploadRequestGroupsVm.showDetails = showDetails;
    uploadRequestGroupsVm.cancelUploadRequestGroups = cancelUploadRequestGroups;
    uploadRequestGroupsVm.closeUploadRequestGroups = closeUploadRequestGroups;
    uploadRequestGroupsVm.archiveUploadRequestGroup = archiveUploadRequestGroup;
    uploadRequestGroupsVm.uploadRequestGroupCreate = lsAppConfig.uploadRequestGroupCreate;
    uploadRequestGroupsVm.uploadRequestGroupDetails = lsAppConfig.uploadRequestGroupDetails;
    uploadRequestGroupsVm.getOwnerName = contactsListsService.getOwnerName;
    uploadRequestGroupsVm.mdTabsSelection = { selectedIndex: 0 };
    uploadRequestGroupsVm.toggleMoreOptions = toggleMoreOptions;
    uploadRequestGroupsVm.setSubmitted = setSubmitted;
    uploadRequestGroupsVm.createUploadRequestGroup = createUploadRequestGroup;
    uploadRequestGroupsVm.itemsList = uploadRequestGroups;
    uploadRequestGroupsVm.status = $stateParams.status;
    uploadRequestGroupsVm.paramFilter = { label: '' };
    uploadRequestGroupsVm.toggleSearchState = toggleSearchState;
    uploadRequestGroupsVm.currentSelectedDocument = {};
    uploadRequestGroupsVm.openUploadRequestGroup = openUploadRequestGroup;
    uploadRequestGroupsVm.removeArchivedUploadRequestGroups = removeArchivedUploadRequestGroups;
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

    tableParamsService.initTableParams(uploadRequestGroupsVm.itemsList, uploadRequestGroupsVm.paramFilter)
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
  function loadSidebarContent(content, groupMode) {
    uploadRequestGroupsVm.groupMode = groupMode;
    uploadRequestGroupsVm.uploadRequestObject = new UploadRequestObjectService({ groupMode });
    $scope.mainVm.sidebar.setData(uploadRequestGroupsVm);
    $scope.mainVm.sidebar.setContent(content || lsAppConfig.uploadRequestGroupCreate);
    $scope.mainVm.sidebar.show();
  }

  function toggleMoreOptions(state) {
    uploadRequestGroupsVm.mdTabsSelection.selectedIndex = state ? 1 : 0;
  }

  /**
   *  @name createUploadRequestGroup
   *  @desc Valid the object and call the method save on object UploadRequest
   *  @param {Object} form - An Object representing the form
   *  @param {Object} newUploadRequest - An object containing all informations of the uploadRequest
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function createUploadRequestGroup(form, newUploadRequest) {
    if (handleErrors(uploadRequestGroupsVm.uploadRequestObject)) {
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
          uploadRequestGroupsVm.status === 'pending' && request.status === 'CREATED' ||
          uploadRequestGroupsVm.status === 'activeClosed' && request.status === 'ENABLED'
        ) {
          uploadRequestGroupsVm.itemsList.push(request);
          uploadRequestGroupsVm.tableParams.reload();
        }

        $state.go('uploadRequestGroups', {
          status: request.status === 'CREATED' ? 'pending' : 'activeClosed'
        });
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
   *  @param {Object} uploadRequestObject - Object contains data of upload requests
   *  @memberOf LinShare.UploadRequests.uploadRequestGroupsController
   */
  function handleErrors(uploadRequestObject) {
    if (uploadRequestObject.getRecipients().length === 0) {
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
  function showDetails(uploadRequest = {}) {
    $q.all([
      uploadRequestGroupRestService.get(uploadRequest.uuid),
      uploadRequestGroupRestService.listUploadRequests(uploadRequest.uuid)
    ]).then(([uploadRequestGroup, uploadRequests]) => {
      uploadRequestGroupsVm.currentSelected = uploadRequestGroup;
      uploadRequestGroupsVm.currentSelected.recipients = [];

      uploadRequests.forEach(uploadRequest => {
        uploadRequestGroupsVm.currentSelected.recipients.push(...uploadRequest.recipients.map(recipient => recipient.mail));
      });

      loadSidebarContent(uploadRequestGroupsVm.uploadRequestGroupDetails, true);
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

  function openUploadRequestGroup(uploadRequest) {
    if (uploadRequest.collective) {
      return uploadRequestGroupRestService.listUploadRequests(uploadRequest.uuid)
        .then(requests => {
          $state.go('uploadRequest', { uuid: requests[0].uuid });
        });
    }

    $state.go('uploadRequestGroup', { uuid: uploadRequest.uuid });
  }
}
