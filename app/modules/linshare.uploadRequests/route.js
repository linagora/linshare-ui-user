angular
  .module('linshare.uploadRequests')
  .config(uploadRequestsConfig);

uploadRequestsConfig.$inject = ['$stateProvider'];

function uploadRequestsConfig($stateProvider) {
  $stateProvider
    .state('uploadRequests', {
      parent: 'common',
      url: '/uploadRequests',
      template: require('./views/uploadRequests.html'),
      resolve: {
        functionality: function($transition$, $state, functionalities) {
          if (!functionalities.UPLOAD_REQUEST.enable) {
            $transition$.abort();
            $state.go('home');
          }
        }
      }
    });
}