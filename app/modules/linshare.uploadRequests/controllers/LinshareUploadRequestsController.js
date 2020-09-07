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
  'lsAppConfig',
  'UploadRequestObjectService',
  'toastService',
  'functionalities'
];

/**
 * @namespace LinshareUploadRequestsController
 * @desc Application upload request management system controller
 * @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
 */
function LinshareUploadRequestsController(
  _,
  $scope,
  lsAppConfig,
  UploadRequestObjectService,
  toastService,
  functionalities
) {
  const uploadRequestVm = this;

  uploadRequestVm.$onInit = onInit;

  function onInit() {
    uploadRequestVm.isCollectiveModeEnabled = functionalities.UPLOAD_REQUEST__GROUPED_MODE && functionalities.UPLOAD_REQUEST__GROUPED_MODE.enabled;

    uploadRequestVm.loadSidebarContent = loadSidebarContent;
    uploadRequestVm.uploadRequestCreate = lsAppConfig.uploadRequestCreate;
    uploadRequestVm.mdTabsSelection = {
      selectedIndex: 0
    };
    uploadRequestVm.toggleMoreOptions = toggleMoreOptions;
    uploadRequestVm.setSubmitted = setSubmitted;
    uploadRequestVm.createUploadRequest = createUploadRequest;
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
    }

    newUploadRequest.create().then(function() {
      $scope.mainVm.sidebar.hide(newUploadRequest);
      toastService.success({key: 'UPLOAD_REQUESTS.FORM_CREATE.SUCCESS'});
      newUploadRequest.tableParams.reload();
    });
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

