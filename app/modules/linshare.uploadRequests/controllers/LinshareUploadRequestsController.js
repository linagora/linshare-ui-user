/**
 * LinShareUploadRequestsController Controller
 * @namespace UploadRequests
 * @memberOf LinShare
 */

angular
  .module('linshare.uploadRequests')
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('uploadRequests');
    $translatePartialLoaderProvider.addPart('filesList');
  }])
  .controller('LinshareUploadRequestsController', LinshareUploadRequestsController);

LinshareUploadRequestsController.$inject = [
  '_',
  '$q',
  '$scope',
  '$state',
  '$stateParams',
  'contactsListsService',
  'lsAppConfig',
  'toastService',
  'tableParamsService',
  'uploadRequests',
  'UploadRequestObjectService',
  'uploadRequestRestService',
  'uploadRequestUtilsService'
];

/**
 * @namespace LinshareUploadRequestsController
 * @desc Application upload request management system controller
 * @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
 */
function LinshareUploadRequestsController(
  _,
  $q,
  $scope,
  $state,
  $stateParams,
  contactsListsService,
  lsAppConfig,
  toastService,
  tableParamsService,
  uploadRequests,
  UploadRequestObjectService,
  uploadRequestRestService,
  uploadRequestUtilsService
) {
  const uploadRequestVm = this;
  const { openWarningDialogFor, showToastAlertFor } = uploadRequestUtilsService;

  uploadRequestVm.$onInit = onInit;

  function onInit() {
    uploadRequestVm.loadSidebarContent = loadSidebarContent;
    uploadRequestVm.showDetails = showDetails;
    uploadRequestVm.cancelUploadRequests = cancelUploadRequests;
    uploadRequestVm.closeUploadRequests = closeUploadRequests;
    uploadRequestVm.uploadRequestCreate = lsAppConfig.uploadRequestCreate;
    uploadRequestVm.uploadRequestDetails = lsAppConfig.uploadRequestDetails;
    uploadRequestVm.getOwnerName = contactsListsService.getOwnerName;
    uploadRequestVm.mdTabsSelection = { selectedIndex: 0 };
    uploadRequestVm.toggleMoreOptions = toggleMoreOptions;
    uploadRequestVm.setSubmitted = setSubmitted;
    uploadRequestVm.createUploadRequest = createUploadRequest;
    uploadRequestVm.itemsList = uploadRequests;
    uploadRequestVm.status = $stateParams.status;
    uploadRequestVm.paramFilter = { label: '' };
    uploadRequestVm.currentSelectedDocument = {};
    uploadRequestVm.fabButton = {
      toolbar: {
        activate: true,
        label: 'UPLOAD_REQUESTS.TITLE'
      },
      actions: [
        {
          action: () => uploadRequestVm.loadSidebarContent(uploadRequestVm.uploadRequestCreate, true),
          label: 'UPLOAD_REQUESTS.CREATION_TYPE.COLLECTIVE',
          icon: 'ls-upload-request-alt',
        },
        {
          action: () => uploadRequestVm.loadSidebarContent(uploadRequestVm.uploadRequestCreate, false),
          label: 'UPLOAD_REQUESTS.CREATION_TYPE.INDIVIDUAL',
          icon: 'ls-upload-request-2',
        }
      ]
    };

    tableParamsService.initTableParams(uploadRequestVm.itemsList, uploadRequestVm.paramFilter)
      .then(() => {
        uploadRequestVm.tableParamsService = tableParamsService;
        uploadRequestVm.resetSelectedUploadRequests = tableParamsService.resetSelectedItems;
        uploadRequestVm.selectUploadRequestsOnCurrentPage = tableParamsService.tableSelectAll;
        uploadRequestVm.addSelectedUploadRequest = tableParamsService.toggleItemSelection;
        uploadRequestVm.sortDropdownSetActive = tableParamsService.tableSort;
        uploadRequestVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
        uploadRequestVm.selectedUploadRequests = tableParamsService.getSelectedItemsList();
        uploadRequestVm.tableParams = tableParamsService.getTableParams();
        uploadRequestVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
        uploadRequestVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
        uploadRequestVm.canCloseSelectedUploadRequests = () => uploadRequestVm.selectedUploadRequests.every(request => request.status === 'ENABLED');
      });
  }

  /**
   * @name loadSidebarContent
   * @desc Update the content of the sidebar
   * @param {String} content - The id of the content to load
   *                           See app/views/includes/sidebar-right.html for possible values
   * @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
   */
  function loadSidebarContent(content, groupMode) {
    uploadRequestVm.groupMode = groupMode;
    uploadRequestVm.uploadRequestObject = new UploadRequestObjectService({ groupMode });
    $scope.mainVm.sidebar.setData(uploadRequestVm);
    $scope.mainVm.sidebar.setContent(content || lsAppConfig.uploadRequestCreate);
    $scope.mainVm.sidebar.show();
  }

  function toggleMoreOptions(state) {
    uploadRequestVm.mdTabsSelection.selectedIndex = state ? 1 : 0;
  }

  /**
   *  @name createUploadRequest
   *  @desc Valid the object and call the method save on object UploadRequest
   *  @param {Object} form - An Object representing the form
   *  @param {Object} newUploadRequest - An object containing all informations of the uploadRequest
   *  @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
   */
  function createUploadRequest(form, newUploadRequest) {
    if (handleErrors(uploadRequestVm.uploadRequestObject)) {
      return;
    }

    if (!form.$valid) {
      uploadRequestVm.setSubmitted(form);
      toastService.error({ key: 'UPLOAD_REQUESTS.FORM_CREATE.FORM_INVALID'});
    } else {
      newUploadRequest.create().then(request => {
        $scope.mainVm.sidebar.hide(newUploadRequest);
        toastService.success({key: 'UPLOAD_REQUESTS.FORM_CREATE.SUCCESS'});

        if (
          uploadRequestVm.status === 'pending' && request.status === 'CREATED' ||
          uploadRequestVm.status === 'activeClosed' && request.status === 'ENABLED'
        ) {
          uploadRequestVm.itemsList.push(request);
          uploadRequestVm.tableParams.reload();
        }

        $state.go('uploadRequests', {
          status: request.status === 'CREATED' ? 'pending' : 'activeClosed'
        });
      });
    }
  }

  /**
   *  @name setSubmitted
   *  @desc Set a form & subform to the state 'submitted'
   *  @param {DOM Object} form - The form to set to submitted state
   *  @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
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
   *  @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
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
   *  @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
   */
  function showDetails(uploadRequest = {}) {
    uploadRequestRestService.get(uploadRequest.uuid).then(data => {
      uploadRequestVm.currentSelected = data;
      loadSidebarContent(uploadRequestVm.uploadRequestDetails, true);
    });
  }

  function cancelUploadRequests(uploadRequests) {
    openWarningDialogFor('cancellation', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(
          request => uploadRequestRestService.updateStatus(request.uuid, 'CANCELED')
        )
      ))
      .then(promises => {
        const canceledRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notCanceledRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(reject => reject.reason);

        _.remove(uploadRequestVm.itemsList, item => canceledRequests.some(request => request.uuid === item.uuid));
        _.remove(uploadRequestVm.selectedUploadRequests, selected => canceledRequests.some(request => request.uuid === selected.uuid));

        uploadRequestVm.tableParams.reload();

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
          .map(reject => reject.reason);

        _.remove(uploadRequestVm.itemsList, item => closedRequests.some(request => request.uuid === item.uuid));
        _.remove(uploadRequestVm.selectedUploadRequests, selected => closedRequests.some(request => request.uuid === selected.uuid));

        uploadRequestVm.tableParams.reload();

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
}

