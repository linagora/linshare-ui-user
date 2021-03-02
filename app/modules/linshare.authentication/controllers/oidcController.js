/**
 * oidcController Controller
 * @namespace linshareUiUserApp
 */
angular
  .module('linshare.authentication')
  .controller('oidcController', oidcController);

oidcController.$inject = [
  '$q',
  '$state',
  'authenticationRestService',
  'lsAppConfig',
  'oidcService',
  'toastService',
  'homePageService'
];

function oidcController(
  $q,
  $state,
  authenticationRestService,
  lsAppConfig,
  oidcService,
  toastService,
  homePageService
) {
  oidcService.endSigninMainWindow()
    .then(user => {
      if (user && user.access_token) {
        return submitToken(user.access_token);
      } else {
        return $q.reject();
      }
    })
    .then(() => {
      $state.go(homePageService.getHomePage());
    })
    .catch(() => {
      toastService.error({ key: 'LOGIN.NOTIFICATION.ERROR_OIDC' });
      $state.go('login');
    });

  function submitToken(token) {
    return authenticationRestService.loginWithAccessToken(token)
      .then(user => {
        toastService.info({
          key: 'LOGIN.NOTIFICATION.SUCCESS',
          params: {
            firstName: user.firstName
          }
        });
      });
  }
}
