const Oidc = require('oidc-client');

/**
 * Authentication oidc service
 * @namespace LinShare.authentication
 */

angular
  .module('linshare.authentication')
  .factory('oidcService', oidcService);

oidcService.$inject = ['OIDC_SETTINGS'];

function oidcService(OIDC_SETTINGS) {
  let manager = new Oidc.UserManager(OIDC_SETTINGS);

  function signInRedirect() {
    return manager.signinRedirect();
  }

  function endSigninMainWindow() {
    return manager.signinRedirectCallback();
  }
  
  return {
    signInRedirect,
    endSigninMainWindow
  };
}
