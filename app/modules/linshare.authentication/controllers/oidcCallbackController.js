angular
  .module('linshare.authentication')
  .controller('oidcCallbackController', oidcCallbackController);

oidcCallbackController.$inject = [
  '$q',
  '$state',
  '$log',
  'authenticationRestService',
  'oidcService',
  'toastService',
  'homePageService',
  'lsAppConfig'
];

function oidcCallbackController(
  $q,
  $state,
  $log,
  authenticationRestService,
  oidcService,
  toastService,
  lsAppConfig
) {

  oidcService.signinRedirectCallback()
    .then(user => {
      if (user && user.access_token) {
        return submitToken(user.access_token);
      }

      return $q.reject();
    })
    .catch(error => {
      $log.error(error);
      toastService.error({ key: 'LOGIN.NOTIFICATION.ERROR_OIDC' });

      if (!lsAppConfig.oidcForceRedirection) {
        $state.go('login');
      }
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
