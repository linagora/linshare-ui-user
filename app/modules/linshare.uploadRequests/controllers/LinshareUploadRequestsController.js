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
  '$scope',
  '$state',
  '$stateParams',
  'lsAppConfig',
  'UploadRequestObjectService',
  'toastService',
  'uploadRequests',
  'tableParamsService'
];

/**
 * @namespace LinshareUploadRequestsController
 * @desc Application upload request management system controller
 * @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
 */
function LinshareUploadRequestsController(
  _,
  $scope,
  $state,
  $stateParams,
  lsAppConfig,
  UploadRequestObjectService,
  toastService,
  uploadRequests,
  tableParamsService
) {
  const uploadRequestVm = this;

  uploadRequestVm.$onInit = onInit;

  function onInit() {
    uploadRequestVm.loadSidebarContent = loadSidebarContent;
    uploadRequestVm.uploadRequestCreate = lsAppConfig.uploadRequestCreate;
    uploadRequestVm.mdTabsSelection = {
      selectedIndex: 0
    };
    uploadRequestVm.toggleMoreOptions = toggleMoreOptions;
    uploadRequestVm.setSubmitted = setSubmitted;
    uploadRequestVm.createUploadRequest = createUploadRequest;
    uploadRequestVm.itemsList = uploadRequests;
    uploadRequestVm.status = $stateParams.status;
    uploadRequestVm.paramFilter = { label: '' };
    uploadRequestVm.currentSelectedDocument = {};

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
}

