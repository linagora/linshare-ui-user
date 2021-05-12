/**
 * Authentication utils service
 * @namespace LinShare.authentication
 */
(function() {
  'use strict';
  angular
    .module('linshare.authentication')
    .factory('authenticationUtilsService', authenticationUtilsService);

  authenticationUtilsService.$inject = ['_'];

  const loginErrors = [
    {
      code: '1001',
      status: 401,
      message: 'LOGIN.NOTIFICATION.ERROR',
      notificationType: 'error'
    },
    {
      code: '1002',
      status: 401,
      message: 'SECOND_FA_LOGIN.NOTIFICATION.OTP',
      notificationType: 'info'
    },
    {
      code: '1003',
      status: 401,
      message: 'SECOND_FA_LOGIN.NOTIFICATION.OTP_ERROR',
      notificationType: 'error'
    },
    {
      code: '1004',
      status: 401,
      message: 'SECOND_FA_LOGIN.NOTIFICATION.ACCOUNT_LOCKED',
      notificationType: 'error'
    }
  ];

  /**
   * @namespace authenticationUtilsService
   * @desc Utils for authentication service
   * @memberOf Linshare.authentication
   */
  function authenticationUtilsService(_) {
    return {
      buildHeader,
      buildBearerTokenHeader,
      checkAuthError
    };

    function checkAuthError(error) {
      return loginErrors.find(loginError => loginError.code === error.headers('x-linshare-auth-error-code'));
    }

    function buildHeader(email, password, otp) {
      var header = { Authorization: 'Basic ' + Base64.Base64.encode(email + ':' + password) };

      return otp ? _.assign(header, { 'x-linShare-2fa-pin': otp }) : header;
    }

    function buildBearerTokenHeader(token) {
      return { Authorization: 'Bearer ' + token };
    }
  }
})();