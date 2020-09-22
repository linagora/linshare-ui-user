
/**
 * workgroupVersionsRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupVersionsRestService', workgroupVersionsRestService);

  workgroupVersionsRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace workgroupVersionsRestService
   *  @desc Service to interact with Workgroup Version object by REST
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupVersionsRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'shared_spaces',
      restParam = 'nodes',
      service = {
        copy: copy,
        download: download,
        get: get,
        getList: getList,
        remove: remove,
        restore: restore,
        getAudit: getAudit,
        thumbnail: thumbnail
      };

    return service;

    ////////////

    /**
     * The Node version object.
     * @typedef {Object} Version
     * @property {String} type - type of the node, for a version it's equal to `DOCUMENT_REVISION`
     * @property {String} uuid - Id of the node
     * @property {String} name - Name of the document
     * @property {String} parent - Parent node id, the document under which all versions are
     * @property {String} workGroup - Id of the parent workgroup
     * @property {String} description - Comment of the version
     * @property {String} metadata - Metadata of the document
     * @property {Object} value - {@link LastAuthor} object
     * @property {Timestamp} creationDate - Date of version creation
     * @property {Timestamp} modificationDate - Date of version modification
     * @property {Number} size - Size in byte of the version document
     * @property {String} mimeType - Mime type of the version document
     * @property {String} sha256sum - Calculated sum of the version document
     * @property {Timestamp} uploadDate - Date of version uploaded
     * @property {Boolean} hasThumbnail - Determine if the version document has a preview to be shown
     */

    /**
     * The LastAuthor object.
     * @typedef {Object} LastAuthor
     * @property {String} name - Name of the user
     * @property {String} mail - Mail of the user
     * @property {String} uuid - Id of the user
     * @property {String} accountType - Account type of the user, either `INTERNAL` | `GUEST`
     */

    /**
     *  @name copy
     *  @desc Copy a Workgroup Version object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} destinationNodeUuid - The id of the destination node object
     *  @param {String} versionNodeUuid - The id of the version node object
     *  @returns {Promise<Version>} server response - The copied node version
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function copy(workgroupUuid, destinationNodeUuid, versionNodeUuid) {
      $log.debug('workgroupVersionsRestService :  download', workgroupUuid, destinationNodeUuid, versionNodeUuid);
      
      return Restangular.one(restUrl, workgroupUuid).one(restParam, destinationNodeUuid).all('copy')
        .post({
          kind: 'SHARED_SPACE',
          uuid: versionNodeUuid,
        });
    }

    /**
     *  @name download
     *  @desc Download a Workgroup Version object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} versionNodeUuid - The id of the version node object
     *  @returns {Promise<Blob>} server response - blob object representing the file
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function download(workgroupUuid, versionNodeUuid) {
      $log.debug('workgroupVersionsRestService :  download', workgroupUuid, versionNodeUuid);
      
      return Restangular.one(restUrl, workgroupUuid).one(restParam, versionNodeUuid).one('download')
        .getRequestedUrl();
    }

    /**
     *  @name get
     *  @desc Get a Workgroup Version object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} versionNodeUuid - The id of the version node object
     *  @returns {Promise<Version>} server response - The created node version
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function get(workgroupUuid, versionNodeUuid) {
      $log.debug('workgroupVersionsRestService :  get', workgroupUuid, versionNodeUuid);
      
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, versionNodeUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the list of Workgroup Version object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} parentNodeUuid - The id of the parent version node object
     *  @returns {Promise<Array<Version>>} server response - The list of the document versions
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function getList(workgroupUuid, parentNodeUuid) {
      $log.debug('workgroupVersionsRestService :  getList', workgroupUuid, parentNodeUuid);
      
      return handler(Restangular.one(restUrl, workgroupUuid).getList(restParam, {
        parent: parentNodeUuid
      }));
    }

    /**
     *  @name remove
     *  @desc Remove a Workgroup Version object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} versionNodeUuid - The id of the version node object
     *  @returns {Promise<Version>} server response - The deleted node version
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function remove(workgroupUuid, versionNodeUuid) {
      $log.debug('workgroupVersionsRestService :  remove', workgroupUuid, versionNodeUuid);
      
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, versionNodeUuid).remove());
    }

    /**
     *  @name Restore
     *  @desc Restore a Workgroup Version object
     - A restoration add a new version on top of history
     based on the source of the selected version to restore
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} parentNodeUuid - The id of the parent node object
     *  @param {String} versionNodeUuid - The id of the version node object
     *  @returns {Promise<Version>} server response - The node set as last version
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function restore(workgroupUuid, parentNodeUuid, versionNodeUuid) {
      $log.debug('workgroupVersionsRestService :  restore', workgroupUuid, parentNodeUuid, versionNodeUuid);
      
      return Restangular.one(restUrl, workgroupUuid).one(restParam, parentNodeUuid).all('copy')
        .post({
          kind: 'SHARED_SPACE',
          uuid: versionNodeUuid,
        });
    }

    /**
     *  @name getAudit
     *  @desc Get audit of a Workgroup version node object
     *  @param {string} workgroupUuid - The id of the Workgroup object
     *  @param {string} versionNodeUuid - The id of the version node object
     *  @returns {Promise<Audit>} server response - The audit of the node version - {@link Audit}
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function getAudit(workgroupUuid, versionNodeUuid) {
      $log.debug('workgroupVersionsRestService :  getAudit', workgroupUuid, versionNodeUuid);

      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, versionNodeUuid).one('audit').get());
    }

    /**
     *  @name thumbnail
     *  @desc Get the file thumbnail of a Workgroup version node object
     *  @param {string} workgroupUuid - The id of the Workgroup object
     *  @param {string} versionNodeUuid - The id of the version node object
     *  @returns {Promise<image/png>} server response - The thumbnail of the node version
     *  @memberOf LinShare.sharedSpace.workgroupVersionsRestService
     */
    function thumbnail(workgroupUuid, versionNodeUuid) {
      $log.debug('workgroupVersionsRestService : thumbnail', workgroupUuid, versionNodeUuid);

      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, versionNodeUuid).one('thumbnail').get({
        base64: true
      }));
    }
  }
})();
