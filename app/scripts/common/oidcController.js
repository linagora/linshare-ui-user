/**
 * oidcController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('oidcController', oidcController);

  oidcController.$inject = [
    'oidcService',
    'authenticationRestService',
    'toastService',
    '$state'
  ];

  /**
   * @namespace oidcController
   * @desc Manage oidc page
   * @memberOf linshareUiUserApp
   */
  function oidcController(oidcService, authenticationRestService, toastService) {
    oidcService.endSigninMainWindow().then(user => {
      if (user && user.access_token) {
        return submitToken(user.access_token);
      } else {
        throw new Error('');
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
        .then(function(user) {
          toastService.info({
            key: 'LOGIN.NOTIFICATION.SUCCESS',
            params: {
              firstName: user.firstName
            }
          });
        });
    }
  }
})();
