angular
  .module('linshare.token')
  .config(routes);

routes.$inject = ['$stateProvider'];

function routes($stateProvider) {
  $stateProvider
    .state('tokenManagement', {
      parent: 'common',
      url: '/token',
      template: require('./views/tokenManagement.html'),
      controller: 'tokenManagementController',
      controllerAs: 'tokenManagementVm',
      resolve: {
        functionality: function($transition$, $state, functionalities) {
          if (
            !functionalities.JWT_PERMANENT_TOKEN.enable ||
            !functionalities.JWT_PERMANENT_TOKEN__USER_MANAGEMENT.enable
          ) {
            $transition$.abort();
            $state.go('home');
          }
        }
      }
    });
}