/**
 * resetPasswordService Factory
 * @namespace LinShare.resetPassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.resetPassword')
    .factory('resetPasswordService', resetPasswordService);

  resetPasswordService.$inject = ['$http', '$log', '$q'];

  /**
   *  @namespace resetPasswordService
   *  @desc Service to interract with resetPassword
   *  @memberOf LinShare.resetPassword
   */
  function resetPasswordService($http, $log, $q) {
    var
      baseRestUrl = 'linshare/webservice/rest/external/reset_password',
      service = {
        get: get,
        reset: reset,
        update: update
      };

    return service;

    ////////////

    /**
     *  @name get
     *  @desc Retrieve information of guest to update
     *  @param {string} uuid - The id of the Reset Token object
     *  @returns {string} Server response
     *  @memberOf LinShare.resetPassword.resetPasswordService
     */

    function get(uuid) {
      var deferred = $q.defer();
      $http.get(baseRestUrl + '/' + uuid).then(function(resetGuestPasswordDto) {
        deferred.resolve(resetGuestPasswordDto);
      }).catch(function(data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }

    /**
     *  @name reset
     *  @desc Request a password reset
     *  @param {string} guestEmail - The email of the Guest object
     *  @returns {string} Server response
     *  @memberOf LinShare.resetPassword.resetPasswordService
     */

    function reset(guestEmail) {
      var deferred = $q.defer();
      var data = {
        mail: guestEmail
      };
      $http.post(baseRestUrl, data).then(function(data) {
        deferred.resolve(data);
      }).catch(function(data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }

    /**
     *  @name update
     *  @desc Update the password of a Guest object
     *  @param {Object} resetGuestPasswordDto - The resetGuestPasswordDto object
     *  @returns {string} Server response
     *  @memberOf LinShare.resetPassword.resetPasswordService
     */

    function update(resetGuestPasswordDto) {
      var deferred = $q.defer();
      $http.put(baseRestUrl + '/' + resetGuestPasswordDto.uuid, resetGuestPasswordDto).then(function(data) {
        deferred.resolve(data);
      }).catch(function(data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
})();
