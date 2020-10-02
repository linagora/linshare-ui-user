angular
  .module('linshare.uploadRequests')
  .config(uploadRequestsConfig);

uploadRequestsConfig.$inject = ['$stateProvider'];

function uploadRequestsConfig($stateProvider) {
  $stateProvider
    .state('uploadRequestGroups', {
      parent: 'common',
      url: '/uploadRequestGroups?status',
      template: require('./views/uploadRequestGroups.html'),
      resolve: {
        functionality: function($transition$, $state, functionalities) {
          if (!functionalities.UPLOAD_REQUEST.enable) {
            $transition$.abort();
            $state.go('home');
          }
        },
        uploadRequestGroups: function($transition$, $state, $stateParams, uploadRequestGroupRestService, UPLOAD_REQUESTS_STATE_STATUS_MAPPING) {
          const requestStatus = UPLOAD_REQUESTS_STATE_STATUS_MAPPING[$stateParams.status];

          if (requestStatus) {
            return uploadRequestGroupRestService.list(requestStatus);
          }

          $transition$.abort();
          $state.go('home');
        }
      },
      controller: 'uploadRequestGroupsController',
      controllerAs: 'uploadRequestGroupsVm',
    })
    .state('uploadRequest', {
      parent: 'common',
      url: '/uploadRequests/:uuid',
      template: require('./views/uploadRequest.html'),
      resolve: {
        uploadRequest: function($stateParams, uploadRequestRestService) {
          return uploadRequestRestService.get($stateParams.uuid);
        }
      },
      controller: 'uploadRequestController',
      controllerAs: 'uploadRequestVm'
    });
}