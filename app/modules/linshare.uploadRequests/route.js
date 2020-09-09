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
        uploadRequests: function(uploadRequestRestService, $stateParams) {
          return uploadRequestRestService.getList($stateParams.status);
        }
      },
      controller: 'LinshareUploadRequestsController',
      controllerAs: 'uploadRequestVm',
    });
}