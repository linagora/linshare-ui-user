/**
 * uploadRestService Service
 * @namespace uploadRestService
 * @memberOf LinShare.upload
 */
(function() {
  'use strict';

  angular
    .module('linshare.upload')
    .factory('uploadRestService', uploadRestService);

  uploadRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace uploadRestService
   * @desc Manage quotas of authenticated user for uploads
   * @memberOf LinShare.upload
   */
  function uploadRestService($log, Restangular, ServerManagerService) {
    var
      errorsMessagesKey = 'UPLOAD_ERROR',
      handler = ServerManagerService.responseHandler,
      restUrl = {
        flow: 'flow',
        quota: 'quota'
      },
      service = {
        getAsyncUploadDetails: getAsyncUploadDetails,
        getQuota: getQuota
      };

    return service;

    ////////////

    /**
     * @name getAsyncUploadDetails
     * @desc Get details of asynchronous upload file
     * @param {string} flowFileUuid - The uuid of flowFile
     * @returns {Promise} server response
     * @memberOf LinShare.upload
     */
    function getAsyncUploadDetails(flowFileUuid) {
      $log.debug('uploadRestService - getAsyncUploadDetails', flowFileUuid, errorsMessagesKey);
      return handler(Restangular.one(restUrl.flow, flowFileUuid).get(), errorsMessagesKey);
    }

    /**
     * @name getQuota
     * @desc Get quota of logged user
     * @param {string} userLoggedUuid - The uuid of logged user
     * @returns {Promise} server response
     * @memberOf LinShare.upload
     */
    function getQuota(userLoggedUuid) {
      $log.debug('uploadRestService - getQuota', userLoggedUuid, errorsMessagesKey);
      return handler(Restangular.one(restUrl.quota, userLoggedUuid).get(), errorsMessagesKey);
    }
  }
})();
