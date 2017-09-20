/**
 * LinshareDocumentRestService factory
 * @namespace LinShare.document
 */
(function() {
  'use strict';

  angular
    .module('linshare.document')
    .factory('LinshareDocumentRestService', LinshareDocumentRestService);

  LinshareDocumentRestService.$inject = ['_', '$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace LinshareDocumentRestService
   *  @desc Service to interact with Document object by REST
   *  @memberOf LinShare.document
   */
  function LinshareDocumentRestService(_, $log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'documents',
      service = {
        create: create,
        copy: copy,
        download: download,
        get: get,
        getAudit: getAudit,
        getList: getList,
        remove: remove,
        restangularize: restangularize,
        thumbnail: thumbnail,
        update: update
      };

    return service;

    ////////////

    /**
     *  @name create
     *  @desc Create a Document object
     *  @param {Object} documentDto - The Document object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function create(documentDto) {
      $log.debug('LinshareDocumentRestService : create', documentDto);
      return handler(Restangular.all(restUrl).post(documentDto));
    }

    /**
     *  @name copy
     *  @desc Copy a Document object
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function copy(uuid) {
      $log.debug('LinshareDocumentRestService : copy', uuid);
      return handler(Restangular.one(restUrl).all('copy').post({
        kind: 'PERSONAL_SPACE',
        uuid: uuid
      }));
    }

    /**
     *  @name download
     *  @desc Download file of a Document object
     *  @param {String} uuid - The id of the Document object
     *  @returns {string} direct download url of the ressource
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function download(uuid) {
      $log.debug('LinshareDocumentRestService : download', uuid);
      return Restangular.all(restUrl).one(uuid, 'download').getRequestedUrl();
    }

    /**
     *  @name get
     *  @desc Get a Document object
     *  @param {String} uuid - The id of the Document object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function get(uuid) {
      $log.debug('LinshareDocumentRestService : get', uuid);
      return handler(Restangular.one(restUrl, uuid).get({
        withShares: true
      }));
    }

    /**
     *  @name getAudit
     *  @desc Get audit of a Document object
     *  @param {string} documentUuid - The uuid of the Document object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function getAudit(documentUuid) {
      $log.debug('LinshareDocumentRestService : getAudit', documentUuid);
      return handler(Restangular.one(restUrl, documentUuid).one('audit').get());
    }

    /**
     *  @name getList
     *  @desc Get the list of the Documents object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function getList() {
      $log.debug('LinshareDocumentRestService: getList');
      return handler(Restangular.all(restUrl).getList());
    }

    /**
     *  @name remove
     *  @desc Remove a Document object
     *  @param {String} uuid - The id of the Document object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function remove(uuid) {
      $log.debug('LinshareDocumentRestService : remove', uuid);
      return handler(Restangular.one(restUrl, uuid).remove());
    }

    /**
     * @name restangularize
     * @desc Restangularize an item
     * @param {Object} item - Item to be restangularized
     * @returns {Object} Restangular object
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function restangularize(item) {
      $log.debug('LinshareDocumentRestService : restangularize', item);
      return Restangular.restangularizeElement(null, item, restUrl);
    }

    /**
     *  @name thumbnail
     *  @desc Get the file thumbnail of a Document object
     *  @param {String} uuid - The id of the Document object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function thumbnail(uuid) {
      $log.debug('LinshareDocumentRestService : thumbnail', uuid);
      return handler(Restangular.one(restUrl, uuid).one('thumbnail').get({
        base64: true
      }));
    }

    /**
     *  @name update
     *  @desc Update a Document object
     *  @param {String} uuid - The id of the Document object
     *  @param {Object} documentDto - The Document object
     *  @returns {Promise} server response
     *  @memberOf LinShare.document.LinshareDocumentRestService
     */
    function update(uuid, documentDto) {
      $log.debug('LinshareDocumentRestService : update', uuid, documentDto);
      var documentUpdated = _.cloneDeep(documentDto);
      if (documentUpdated.thumbnail) {
        delete documentUpdated.thumbnail;
      }
      delete documentUpdated.auditActions;
      return handler(Restangular.one(restUrl, uuid).customPUT(documentUpdated));
    }
  }
})();
