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
        return submitToken(user.access_token, user.id_token);
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


  function submitToken(token, idToken) {
    return authenticationRestService.loginWithAccessToken(token, idToken)
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
