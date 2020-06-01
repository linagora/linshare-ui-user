/**
 * changePasswordRestService
 * @namespace LinShare.changePassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.changePassword')
    .factory('changePasswordRestService', changePasswordRestService);

  changePasswordRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace changePasswordRestService
   * @descService to interact with changePasswordList object by REST
   * @memberOf LinShare.changePassword
   */
  function changePasswordRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      service = {
        getRules: getRules,
        update: update
      };

    return service;

    ////////////

    /**
     * @name getRules
     * @desc Get all validation rules for password
     * @returns {Promise} server response
     * @memberOf LinShare.changePassword.changePasswordRestService
     */
    function getRules() {
      $log.debug('changePasswordRestService - getRules');
      return handler(Restangular.all('authentication').one('password').get().then(function(res) {
        return Restangular.stripRestangular(res);
      }));
    }

    /**
     * @name update
     * @desc update password of a user
     * @param {String} oldPassword - Current password
     * @param {String} newPassword - New password to be updated
     * @returns {Promise} server response
     * @memberOf LinShare.changePassword.changePasswordRestService
     */
    function update(oldPassword, newPassword) {
      $log.debug('changePasswordRestService - update', oldPassword, newPassword);
      return handler(
        Restangular.all('authentication').all('password').post({
          oldPwd: oldPassword,
          newPwd: newPassword
        }),
        null,
        true
      );
    }
  }
})();
