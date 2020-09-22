/**
 * LinshareShareService factory
 * @namespace LinShare.share
 */
(function() {
  'use strict';

  angular
    .module('linshare.share')

  /**
   * @ngdoc service
   * @name linshare.share.service:LinshareShareService
   * @description
   *
   * Service to get and post all information about files shared by the user
   */
    .factory('LinshareShareService', LinshareShareService);

  LinshareShareService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace LinshareShareService
   *  @desc Service to interact with Share object by REST
   *  @memberOf LinShare.share
   */
  function LinshareShareService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'shares',
      service = {
        create: create,
        download: download,
        get: get,
        getList: getList,
        remove: remove,
        thumbnail: thumbnail
      };

    return service;

    ////////////

    /**
     *  @name create
     *  @desc Create a Share object
     *  @param {Object} shareDocumentDto - A Share object
     *  @returns {Promise} server response
     *  @memberOf LinShare.shares.LinshareSahreService
     */
    function create(shareDocumentDto) {
      $log.debug('LinshareShareRestService : create', shareDocumentDto);
      
      return handler(Restangular.all(restUrl).post(shareDocumentDto));
    }

    /**
     *  @name download
     *  @desc Get the file of a Share object
     *  @param {String} uuid - The id of the Share object
     *  @returns {Promise} server response
     *  @memberOf LinShare.shares.LinshareSahreService
     */
    function download(uuid) {
      $log.debug('LinshareShareRestService : download', uuid);
      
      return handler(Restangular.all(restUrl).one(uuid, 'download').withHttpConfig({
        responseType: 'arraybuffer'
      }).get());
    }

    /**
     *  @name get
     *  @desc Get a Share object
     *  @param {String} uuid - The id of the Share object
     *  @returns {Promise} server response
     *  @memberOf LinShare.shares.LinshareSahreService
     */
    function get(uuid) {
      $log.debug('LinshareShareRestService : get', uuid);
      
      return handler(Restangular.one(restUrl, uuid).get());
    }

    /**
     *  @name getList
     *  @desc Get list of the Shares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.shares.LinshareSahreService
     */
    function getList() {
      $log.debug('LinshareShareRestService : getList');
      
      return handler(Restangular.all(restUrl).getList());
    }

    /**
     *  @name remove
     *  @desc Remove a Share object
     *  @param {String} uuid - The id of the Share object
     *  @returns {Promise} server response
     *  @memberOf LinShare.shares.LinshareSahreService
     */
    function remove(uuid) {
      $log.debug('LinshareShareRestService : delete', uuid);
      
      return Restangular.one(restUrl, uuid).remove();
    }

    /**
     *  @name thumbnail
     *  @desc Get the file thumbnail of a Share object
     *  @param {String} uuid - The id of the Share object
     *  @returns {Promise} server response
     *  @memberOf LinShare.shares.LinshareSahreService
     */
    function thumbnail(uuid) {
      $log.debug('LinshareShareRestService : thumbnail', uuid);
      
      return handler(Restangular.one(restUrl, uuid).one('thumbnail').get());
    }
  }
})();
