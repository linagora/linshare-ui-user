const { UserManager } = require('oidc-client');

/**
 * Authentication oidc service
 * @namespace LinShare.authentication
 */

angular
  .module('linshare.authentication')
  .factory('oidcService', oidcService);

oidcService.$inject = ['lsAppConfig'];

function oidcService(lsAppConfig) {
  let manager = new UserManager(lsAppConfig.oidcSetting);

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
