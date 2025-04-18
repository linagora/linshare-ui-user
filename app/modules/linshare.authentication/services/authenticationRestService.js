/**
 * Authentication service
 * @namespace LinShare.authentication
 */
(function() {
  'use strict';
  angular
    .module('linshare.authentication')
    .factory('authenticationRestService', authenticationRestService);

  authenticationRestService.$inject = [
    '$state',
    '_',
    '$location',
    '$log',
    '$q',
    '$window',
    'authService',
    'lsAppConfig',
    'oidcService',
    'Restangular',
    'ServerManagerService',
    'toastService',
    'authenticationUtilsService',
    'guestRestService'
  ];

  /**
   * @namespace authenticationRestService
   * @desc Service to interact with User Authentication object by REST
   * @memberOf Linshare.authentication
   */
  function authenticationRestService(
    $state,
    _,
    $location,
    $log,
    $q,
    $window,
    authService,
    lsAppConfig,
    oidcService,
    Restangular,
    ServerManagerService,
    toastService,
    authenticationUtilsService,
    guestRestService
  ) {
    let deferred = $q.defer();
    const { responseHandler, getErrorMessage } = ServerManagerService;
    const restUrl = 'authentication';

    return {
      checkAuthentication,
      getCurrentUser,
      login,
      loginWithAccessToken,
      logout,
      version
    };

    ////////////

    /**
     * @name checkAuthentication
     * @desc Check user authorization
     * @param {boolean} hideError - Determine if the error shall be hidden to the user
     * @param {boolean} ignoreAuthModule - Determine if the auth module should be ignored
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function checkAuthentication(hideError, ignoreAuthModule) {
      $log.debug('AuthenticationRestService : checkAuthentication');

      return responseHandler(Restangular.all().withHttpConfig({
        ignoreAuthModule: ignoreAuthModule
      }).customGET('authorized', {}, {'X-LinShare-Client-App' : 'Linshare-Web'}), undefined, hideError)
        .then(function (userLoggedIn) {
          if (userLoggedIn.accountType === lsAppConfig.accountType.guest) {
            guestRestService.listGuestRestrictContactslist(userLoggedIn.uuid)
              .then(contactsLists => {
                userLoggedIn.restrictedContactsLists = contactsLists;
                userLoggedIn.restrictedContacts = contactsLists.length > 0 ? true : false;

                deferred.resolve(userLoggedIn);

                return (userLoggedIn);
              })
              .catch(function (error) {
                deferred.reject(error);
                $log.debug('current guest not authenticated', error);

                return error;
              });
          } else {
            deferred.resolve(userLoggedIn);

            return (userLoggedIn);
          }
        }).catch(function(error) {
          deferred.reject(error);
          $log.debug('current user not authenticated', error);

          return error;
        });
    }

    /**
     * @name getCurrentUser
     * @desc get the current user connected
     * @return {Promise}
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function getCurrentUser() {
      $log.debug('AuthenticationRestService : getCurrentUser');

      return deferred.promise;
    }

    /**
     * @name login
     * @desc Login system of the App
     * @param {string} login - Login of the user
     * @param {string} password - Password of the user
     * @param {string} otp - 6 digits of code for second factor authentication
     * @return {Promise} server response
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function login(login, password, otp) {
      deferred = $q.defer();
      $log.debug('AuthenticationRestService : login');

      const headers = authenticationUtilsService.buildHeader(login, password, otp);

      Restangular.all(restUrl)
        .withHttpConfig({ ignoreAuthModule: true })
        .customGET('authorized', {}, headers)
        .then(user => {
          if (user.accountType === lsAppConfig.accountType.guest) {
            guestRestService.listGuestRestrictContactslist(user.uuid)
              .then(contactsLists => {
                user.restrictedContactsLists = contactsLists;
                user.restrictedContacts = contactsLists.length > 0 ? true : false;

                authService.loginConfirmed(user);
                deferred.resolve(user);
              })
              .catch(function (error) {
                deferred.reject(error);
                $log.debug('current guest not authenticated', error);

                return error;
              });
          } else {
            authService.loginConfirmed(user);
            deferred.resolve(user);
          }
        })
        .catch(error => handleAuthError(error, { handle2FA: true, login, password }))
        .catch(deferred.reject);

      return deferred.promise;
    }

    /**
     * @name loginWithAccessToken
     * @desc Login with access token of the App
     * @param {string} token - Access token of the user
     * @return {Promise} server response
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function loginWithAccessToken(token, idToken) {
      deferred = $q.defer();
      $log.debug('AuthenticationRestService : loginSSO');

      const headers = authenticationUtilsService.buildBearerTokenHeader(token);

      headers['X-LinShare-ID-Token'] = idToken;

      Restangular.all(restUrl)
        .withHttpConfig({ ignoreAuthModule: true })
        .customGET('authorized', {}, headers)
        .then(user => {
          if (user.accountType === lsAppConfig.accountType.guest) {
            guestRestService.listGuestRestrictContactslist(user.uuid)
              .then(contactsLists => {
                user.restrictedContactsLists = contactsLists;
                user.restrictedContacts = contactsLists.length > 0 ? true : false;

                authService.loginConfirmed(user);
                deferred.resolve(user);
              })
              .catch(function (error) {
                deferred.reject(error);
                $log.debug('current guest not authenticated', error);

                return error;
              });
          } else {
            authService.loginConfirmed(user);
            deferred.resolve(user);
          }
        })
        .catch(handleAuthError)
        .catch(deferred.reject);

      return deferred.promise;
    }

    function handleAuthError(error, options = {}) {
      const authError = authenticationUtilsService.checkAuthError(error);
      const { handle2FA, login, password } = options;

      if (authError) {
        toastService[authError.notificationType](authError.appendMessage ?
          { key: authError.message, params: { details: authError.details } } :
          { key: authError.message }
        );

        if (authError.code === '1002' && handle2FA)  {
          $state.go('secondFactorAuthenticationLogin', { loginInfo: { login, password }});
        }

        return $q.reject(error);
      }

      return getErrorMessage(error)
        .then(message => toastService.error({ key: message }))
        .then(() => $q.reject(error))
        .catch(() => $q.reject(error));
    }

    /**
     * @name logout
     * @desc Logout system of the App
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function logout() {
      $log.debug('AuthenticationRestService : logout');

      $q.all([
        getCurrentUser(),
        ServerManagerService.getHeaders(),
        responseHandler(Restangular.all(restUrl).withHttpConfig().customGET('logout'))
      ])
        .then(([loggedUser, headers]) => {
          const headersLogoutUrl = headers['x-linshare-post-logout-url'];
          let location;

          if (loggedUser.authWithOIDC) {
            $log.debug('AuthenticationRestService : logout - Initiate logout for OIDC authenticated user');

            return oidcService.signOut();
          }

          if (headersLogoutUrl) {
            if (_.startsWith(headersLogoutUrl, 'http')) {
              $log.debug('AuthenticationRestService : logout - Using X-LINSHARE-POST-LOGOUT-URL for redirection');
              location = headersLogoutUrl;
            }
          }
          if (_.isUndefined(location) && lsAppConfig.postLogoutUrl) {
            $log.debug('AuthenticationRestService : logout - Using lsAppConfig.postLogoutUrl for redirection');
            location = lsAppConfig.postLogoutUrl;
          }
          if (_.isUndefined(location)) {
            $log.debug('AuthenticationRestService : logout - Using current location root for redirection');
            var absUrl = $location.absUrl();

            location = absUrl.split('#')[0];
          }

          authService.loginCancelled();
          $log.debug('Authentication logout: success');
          $window.location.href = location;
        }).catch(function(error) {
          $log.error('Authentication logout : failed', error.status);
        });
    }

    /**
     * @name version
     * @desc Get the version of the core API
     * @return {Promise} server response
     * @memberOf Linshare.authentication.authenticationRestService
     */
    function version() {
      $log.debug('AuthenticationRestService : version');

      return responseHandler(Restangular.one(restUrl, 'version').get());
    }
  }
})();
