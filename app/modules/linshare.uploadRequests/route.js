angular
  .module('linshare.uploadRequests')
  .config(uploadRequestsConfig);

uploadRequestsConfig.$inject = ['$stateProvider'];

function uploadRequestsConfig($stateProvider) {
  $stateProvider
    .state('uploadRequestGroups', {
      parent: 'common',
      url: '/upload_request_groups',
      redirectTo: 'uploadRequestGroups.activeClosed',
      resolve: {
        functionality: function($transition$, $state, functionalities) {
          if (!functionalities.UPLOAD_REQUEST.enable) {
            $transition$.abort();
            $state.go('home');
          }
        }
      }
    })
    .state('uploadRequestGroups.activeClosed', {
      url: '/activeClosed',
      template: require('./views/uploadRequestGroups.html'),
      resolve: {
        uploadRequestGroups: function(uploadRequestGroupRestService) {
          return uploadRequestGroupRestService.list(['ENABLED', 'CLOSED']);
        }
      },
      controller: 'uploadRequestGroupsController',
      controllerAs: 'uploadRequestGroupsVm',
    })
    .state('uploadRequestGroups.pending', {
      url: '/pending',
      template: require('./views/uploadRequestGroups.html'),
      resolve: {
        uploadRequestGroups: function(uploadRequestGroupRestService) {
          return uploadRequestGroupRestService.list('CREATED');
        }
      },
      controller: 'uploadRequestGroupsController',
      controllerAs: 'uploadRequestGroupsVm',
    })
    .state('uploadRequestGroups.archived', {
      url: '/archived',
      template: require('./views/uploadRequestGroups.html'),
      resolve: {
        uploadRequestGroups: function(uploadRequestGroupRestService) {
          return uploadRequestGroupRestService.list('ARCHIVED');
        }
      },
      controller: 'uploadRequestGroupsController',
      controllerAs: 'uploadRequestGroupsVm',
    })
    .state('uploadRequests', {
      parent: 'uploadRequestGroups',
      url: '/upload_request_groups/:uploadRequestGroupUuid/upload_requests',
      template: require('./views/uploadRequests.html'),
      resolve: {
        uploadRequestGroup: function($stateParams, uploadRequestGroupRestService) {
          return uploadRequestGroupRestService.get($stateParams.uploadRequestGroupUuid);
        }
      },
      controller: 'uploadRequestsController',
      controllerAs: 'uploadRequestsVm',
    })
    .state('uploadRequestEntries', {
      parent: 'uploadRequests',
      url: '/:uploadRequestUuid/entries',
      template: require('./views/uploadRequestEntries.html'),
      resolve: {
        uploadRequest: function($stateParams, uploadRequestRestService) {
          return uploadRequestRestService.get($stateParams.uploadRequestUuid);
        }
      },
      controller: 'uploadRequestEntriesController',
      controllerAs: 'uploadRequestEntriesVm'
    });
}