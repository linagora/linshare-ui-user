/**
 * Authentication utils service
 * @namespace LinShare.authentication
 */
(function() {
  'use strict';
  angular
    .module('linshare.authentication')
    .factory('authenticationUtilsService', authenticationUtilsService);

    authenticationUtilsService.$inject = ['_']

  var loginErrors = [
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
      buildHeader: buildHeader,
      findError: findError
    }

    function findError(error) {
      var foundError = _.find(loginErrors, function(loginError) {
        return loginError.code === error.headers('x-linshare-auth-error-code');
      });

      return foundError;
    }

    function buildHeader(email, password, otp) {
      var header = { Authorization: 'Basic ' + Base64.encode(email + ':' + password) };

      return otp ? _.assign(header, { 'x-linShare-2fa-pin': otp }) : header;
    }
  }
})();