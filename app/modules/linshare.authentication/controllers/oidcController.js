/**
 * oidcController Controller
 * @namespace linshareUiUserApp
 */
angular
  .module('linshare.authentication')
  .controller('oidcController', oidcController);

oidcController.$inject = [
  'oidcService',
  'authenticationRestService',
  'toastService',
  '$state',
  '$q'
];

function oidcController(oidcService, authenticationRestService, toastService, $q) {
  oidcService.endSigninMainWindow().then(user => {
    if (user && user.access_token) {
      return submitToken(user.access_token);
    } else {
      return $q.reject();
    }
  }).catch(() => {
    toastService.error({
      key: 'LOGIN.NOTIFICATION.ERROR'
    });
  }).finally(() => {
    window.location.href = window.location.origin;
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
