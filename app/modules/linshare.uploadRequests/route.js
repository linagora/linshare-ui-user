angular
  .module('linshare.uploadRequests')
  .config(uploadRequestsConfig);

uploadRequestsConfig.$inject = ['$stateProvider'];

function uploadRequestsConfig($stateProvider) {
  $stateProvider
    .state('uploadRequests', {
      parent: 'common',
      url: '/uploadRequests?status',
      template: require('./views/uploadRequests.html'),
      resolve: {
        functionality: function($transition$, $state, functionalities) {
          if (!functionalities.UPLOAD_REQUEST.enable) {
            $transition$.abort();
            $state.go('home');
          }
        },
        uploadRequests: function($transition$, $state, $stateParams, uploadRequestRestService, UPLOAD_REQUESTS_STATE_STATUS_MAPPING) {
          const requestStatus = UPLOAD_REQUESTS_STATE_STATUS_MAPPING[$stateParams.status];

          if (requestStatus) {
            return uploadRequestRestService.getList(requestStatus);
          }

          $transition$.abort();
          $state.go('home');
        }
      },
      controller: 'LinshareUploadRequestsController',
      controllerAs: 'uploadRequestVm',
    });
}