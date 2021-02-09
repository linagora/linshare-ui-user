const { UserManager } = require('oidc-client');

angular
  .module('linshare.authentication')
  .factory('oidcService', oidcService);

oidcService.$inject = ['lsAppConfig'];

function oidcService(lsAppConfig) {
  let manager = new UserManager(lsAppConfig.oidcSetting);

  return {
    signInRedirect,
    signOut,
    endSigninMainWindow
  };

  function signInRedirect() {
    return manager.signinRedirect();
  }

  function endSigninMainWindow() {
    return manager.signinRedirectCallback();
  }

  function signOut() {
    return manager.signoutRedirect();
  }

}
