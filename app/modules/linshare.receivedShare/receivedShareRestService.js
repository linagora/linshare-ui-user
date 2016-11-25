/**
 * receivedShareRestService factory
 * @namespace LinShare.receivedShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.receivedShare')
    .factory('receivedShareRestService', receivedShareRestService);

  receivedShareRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace receivedShareRestService
   *  @desc Service to interact with ReceivedShare object by REST
   *  @memberOf LinShare.receivedShare
   */
  function receivedShareRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'received_shares',
      service = {
        copy: copy,
        download: download,
        get: get,
        getList: getList,
        remove: remove,
        thumbnail: thumbnail
      };

    return service;

    ////////////

    /**
     *  @name copy
     *  @desc Copy a ReceivedShares object to the personal space
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function copy(uuid) {
      $log.debug('LinshareReceivedShareRestService : copy', uuid);
      return handler(Restangular.one(restUrl).one('copy', uuid).post());
    }

    /**
     *  @name download
     *  @desc Download file of a ReceivedShares object
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function download(uuid) {
      $log.debug('LinshareReceivedShareRestService : download', uuid);
      return handler(Restangular.one(restUrl, uuid).one('download').get());
    }

    /**
     *  @name get
     *  @desc Get a ReceivedShares object
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function get(uuid) {
      $log.debug('LinshareReceivedShareRestService : get', uuid);
      return handler(Restangular.one(restUrl, uuid).get());
    }

    /**
     *  @name getList
     *  @desc Get list of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function getList() {
      $log.debug('LinshareReceivedShareRestService : getList');
      return handler(Restangular.all(restUrl).getList());
    }

    /**
     *  @name remove
     *  @desc Remove a ReceivedShares object
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function remove(uuid) {
      $log.debug('LinshareReceivedShareRestService : delete', uuid);
      return handler(Restangular.one(restUrl, uuid).remove());
    }

    /**
     *  @name thumbnail
     *  @desc Get the thumbnail of a ReceivedShares object file
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function thumbnail(uuid) {
      $log.debug('LinshareReceivedShareRestService : thumbnail', uuid);
      return handler(Restangular.one(restUrl, uuid).one('thumbnail').get({
        base64: true
      }));
    }
  }
})();
