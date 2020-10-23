/**
 * Authentication oidc settings
 * @namespace LinShare.authentication
 */

/* eslint-disable camelcase */
angular
  .module('linshare.authentication')
  .constant('OIDC_SETTINGS', {
    authority: 'http://localhost:8888/auth/realms/master',
    client_id: 'linshare',
    client_secret: '2884caa9-1b45-465f-bc3f-7ca5c3a22537',
    redirect_uri: 'http://localhost:20081/#!/oidc',
    post_logout_redirect_uri: 'http://localhost:20081/#!/login',
    response_type: 'code',
    scope: 'openid email profile'
  });
