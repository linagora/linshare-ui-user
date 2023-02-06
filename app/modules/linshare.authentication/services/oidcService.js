/* eslint-disable camelcase */

const { UserManager } = require('oidc-client');

angular
  .module('linshare.authentication')
  .factory('oidcService', oidcService);

oidcService.$inject = ['lsAppConfig'];

function oidcService(lsAppConfig) {
  let manager = new UserManager({
    authority: lsAppConfig.oidcSetting.authority,
    client_id: lsAppConfig.oidcSetting.client_id,
    client_secret: lsAppConfig.oidcSetting.client_secret,
    scope: lsAppConfig.oidcSetting.scope,
    redirect_uri: `${window.location.origin}/oidc/callback`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    response_type: 'code'
  });

  return {
    signInRedirect,
    signOut,
    signinRedirectCallback
  };

  function signInRedirect() {
    return manager.signinRedirect();
  }

  function signinRedirectCallback() {
    return manager.signinRedirectCallback();
  }

  function signOut() {
    return manager.signoutRedirect();
  }

}
