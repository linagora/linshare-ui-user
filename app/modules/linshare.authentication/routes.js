angular
  .module('linshare.authentication')
  .config(authenticationConfig);

authenticationConfig.$inject = ['$stateProvider'];

function authenticationConfig($stateProvider) {
  $stateProvider
    .state('oidc', {
      url: '/oidc',
      controller: 'oidcController',
      params: {
        loginRequired: false
      }
    });
}


