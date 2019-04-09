
/**
 * workgroupRevisionsRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupRevisionsRestService', workgroupRevisionsRestService);

  workgroupRevisionsRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace workgroupRevisionsRestService
   *  @desc Service to interact with Workgroup Revision object by REST
   *  @revisionOf LinShare.sharedSpace
   */
  function workgroupRevisionsRestService($log, Restangular, ServerManagerService) {
    var
    handler = ServerManagerService.responseHandler,
    restUrl = 'work_groups',
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
     * The Node revision object.
     * @typedef {Object} Revision
     * @property {String} type - type of the node, for a revision it's equal to `DOCUMENT_REVISION`
     * @property {String} uuid - Id of the node
     * @property {String} name - Name of the document
     * @property {String} parent - Parent node id, the document under which all revisions are
     * @property {String} workGroup - Id of the parent workgroup
     * @property {String} description - Comment of the revision
     * @property {String} metadata - Metadata of the document
     * @property {Object} value - {@link LastAuthor} object
     * @property {Timestamp} creationDate - Date of revision creation
     * @property {Timestamp} modificationDate - Date of revision modification
     * @property {Number} size - Size in byte of the revision document
     * @property {String} mimeType - Mime type of the revision document
     * @property {String} sha256sum - Calculated sum of the revision document
     * @property {Timestamp} uploadDate - Date of revision uploaded
     * @property {Boolean} hasThumbnail - Determine if the revision document has a preview to be shown
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
     *  @desc Copy a Workgroup Revision object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} destinationNodeUuid - The id of the destination node object
     *  @param {String} revisionNodeUuid - The id of the revision node object
     *  @returns {Promise<Revision>} server response - The copied node revision
     *  @revisionOf LinShare.sharedSpace.workgroupRevisionsRestService
     */
    function copy(workgroupUuid, destinationNodeUuid, revisionNodeUuid) {
      $log.debug('workgroupRevisionsRestService :  download', workgroupUuid, destinationNodeUuid, revisionNodeUuid);
      return Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, destinationNodeUuid).one('copy')
        .post({
          kind: 'SHARED_SPACE',
          uuid: revisionNodeUuid,
        });
    }

    /**
     *  @name download
     *  @desc Download a Workgroup Revision object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} revisionNodeUuid - The id of the revision node object
     *  @returns {Promise<Blob>} server response - blob object representing the file
     *  @revisionOf LinShare.sharedSpace.workgroupRevisionsRestService
     */
    function download(workgroupUuid, revisionNodeUuid) {
      $log.debug('workgroupRevisionsRestService :  download', workgroupUuid, revisionNodeUuid);
      return Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, nodeUuid).one('download')
        .getRequestedUrl();
    }

    /**
     *  @name get
     *  @desc Get a Workgroup Revision object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} revisioNodeUuid - The id of the revision node object
     *  @returns {Promise<Revision>} server response - The created node revision
     *  @revisionOf LinShare.sharedSpace.workgroupRevisionsRestService
     */
    function get(workgroupUuid, revisionNodeUuid) {
      $log.debug('workgroupRevisionsRestService :  get', workgroupUuid, revisionNodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, revisionNodeUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the list of Workgroup Revision object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} parentNodeUuid - The id of the parent revision node object
     *  @returns {Promise<Array<Revision>>} server response - The list of the document revisions
     *  @revisionOf LinShare.sharedSpace.workgroupRevisionsRestService
     */
    function getList(workgroupUuid, parentNodeUuid) {
      $log.debug('workgroupRevisionsRestService :  getList', workgroupUuid, parentNodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).getList(restParam, {
        parent: parentNodeUuid
      }));
    }

    /**
     *  @name remove
     *  @desc Remove a Workgroup Revision object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} revisionNodeUuid - The id of the revision node object
     *  @returns {Promise<Revision>} server response - The deleted node revision
     *  @revisionOf LinShare.sharedSpace.workgroupRevisionsRestService
     */
    function remove(workgroupUuid, revisionNodeUuid) {
      $log.debug('workgroupRevisionsRestService :  remove', workgroupUuid, revisionNodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, revisionNodeUuid).remove());
    }

    /**
     *  @name Restore
     *  @desc Restore a Workgroup Revision object
     - A restoration add a new revision on top of history
     based on the source of the selected revision to restore
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} parentNodeUuid - The id of the parent node object
     *  @param {String} revisionNodeUuid - The id of the revision node object
     *  @returns {Promise<Revision>} server response - The node set as last revision
     *  @revisionOf LinShare.sharedSpace.workgroupRevisionsRestService
     */
    function restore(workgroupUuid, parentNodeUuid, revisionNodeUuid) {
      $log.debug('workgroupRevisionsRestService :  restore', workgroupUuid, parentNodeUuid, revisionNodeUuid);
      return Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, parentNodeUuid).one('copy')
        .post({
          kind: 'SHARED_SPACE',
          uuid: revisionNodeUuid,
        });
    }

    function getAudit(workgroupUuid, nodeUuid) {
      console.log('getAudit: Please code me and add documentation');
    }

    function thumbnail(workgroupUuid, nodeUuid) {
      console.log('thumbnail: Please code me and add documentation');
    }
  }
})();
