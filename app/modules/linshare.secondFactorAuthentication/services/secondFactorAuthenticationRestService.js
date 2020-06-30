/**
 * secondFactorAuthenticationRestService
 * @namespace LinShare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .factory('secondFactorAuthenticationRestService', secondFactorAuthenticationRestService);

  secondFactorAuthenticationRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace secondFactorAuthenticationRestService
   * @descService to interact with secondFactorAuthenticationList object by REST
   * @memberOf LinShare.secondFactorAuthentication
   */
  function secondFactorAuthenticationRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      service = {
        getStatus: getStatus,
        create: create,
        remove: remove
      };

    return service;

    ////////////

    /**
     * @name getStatus
     * @desc Get current status of user's second factor authentication
     * @returns {Promise} server response
     * @memberOf LinShare.secondFactorAuthentication.secondFactorAuthenticationRestService
     */
    function getStatus(userUuid) {
      $log.debug('secondFactorAuthenticationRestService - getStatus');

      return handler(Restangular.all('authentication').all('2fa').get(userUuid).then(function(res) {
        return Restangular.stripRestangular(res);
      }));
    }

    /**
     * @name create
     * @desc create second factor authentication for user
     * @returns {Promise} server response
     * @memberOf LinShare.secondFactorAuthentication.secondFactorAuthenticationRestService
     */
    function create() {
      $log.debug('secondFactorAuthenticationRestService - create');

      return handler(Restangular.all('authentication').all('2fa').post({}));
    }

    /**
     * @name remove
     * @desc remove second factor authentication for user
     * @returns {Promise} server response
     * @memberOf LinShare.secondFactorAuthentication.secondFactorAuthenticationRestService
     */
    function remove(userUuid) {
      $log.debug('secondFactorAuthenticationRestService - remove');

      return handler(Restangular.all('authentication').one('2fa', userUuid).remove());
    }
  }
})();
