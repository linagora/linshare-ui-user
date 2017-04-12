/**
 * workgroupNodesRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupNodesRestService', workgroupNodesRestService);

  workgroupNodesRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace workgroupNodesRestService
   *  @desc Service to interact with Workgroup Nodes object by REST
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupNodesRestService($log, Restangular, ServerManagerService) {
    var
      errorsMessagesKey = 'WORKGROUP_NODES_ERROR',
      handler = ServerManagerService.responseHandler,
      restUrl = 'work_groups',
      restParam = 'nodes',
      service = {
        copy: copy,
        create: create,
        download: download,
        get: get,
        getList: getList,
        remove: remove,
        thumbnail: thumbnail,
        update: update
      };

    return service;

    ////////////

    /**
     *  @name copy
     *  @desc copy a Workgroup Node object
     *  @param {string} workgroupUuid - The uuid of the Workgroup object
     *  @param {object} nodeItem - Node to duplicate
     *  @param {string} destinationNodeUuid - The uuid of the Destination Node object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function copy(workgroupUuid, nodeItem, destinationNodeUuid) {
      $log.debug('workgroupNodesRestService : copy', workgroupUuid, nodeItem.uuid, destinationNodeUuid);
      var _destinationNodeUuid = _.isNil(destinationNodeUuid) ? '' : destinationNodeUuid;
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeItem.uuid)
        .all('copy').post(nodeItem, {destinationNodeUuid:  _destinationNodeUuid}), errorsMessagesKey);
    }

    /**
     *  @name create
     *  @desc Create a Workgroup Node object
     *  @param {string} workgroupUuid - The id of a Workgroup object
     *  @param {Object} workgroupFolderDto - The Workgroup Folder object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupFoldersRestService
     */
    function create(workgroupUuid, workgroupFolderDto) {
      $log.debug('workgroupNodesRestService : create', workgroupUuid, workgroupFolderDto);
      return handler(Restangular.one(restUrl, workgroupUuid).all(restParam).post(workgroupFolderDto));
    }

    /**
     *  @name download
     *  @desc Download a Workgroup Node object
     *  @param {string} workgroupUuid - The uuid of the Workgroup object
     *  @param {string} nodeUuid - The uuid of the Workgroup Node object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function download(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : download', workgroupUuid, nodeUuid);
      return handler(Restangular.all(restUrl).one(workgroupUuid, restParam).one(nodeUuid, 'download')
        .withHttpConfig({
          responseType: 'arraybuffer'
        }).get());
    }

    /**
     *  @name get
     *  @desc Get a Workgroup Node object
     *  @param {string} workgroupUuid - The uuid of the Workgroup object
     *  @param {string} nodeUuid - The uuid of the Workgroup Node object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function get(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : get', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the List of Workgroup Node object
     *  @param {string} workgroupUuid - The uuid of the Workgroup object
     *  @param {string} parentUuid - The uuid of a Workgroup Folder object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function getList(workgroupUuid, parentUuid) {
      $log.debug('workgroupNodesRestService : getList', workgroupUuid, parentUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).getList(restParam, {
        parent: parentUuid
      }));
    }

    /**
     *  @name remove
     *  @desc Remove a Workgroup Node object
     *  @param {string} workgroupUuid - The uuid of the Workgroup object
     *  @param {string} nodeUuid - The uuid of the Workgroup Node object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function remove(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : remove', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).remove());
    }

    /**
     *  @name thumbnail
     *  @desc Get the file thumbnail of a Workgroup Node object
     *  @param {string} workgroupUuid - The uuid of the Workgroup object
     *  @param {string} nodeUuid - The uuid of the Workgroup Node object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function thumbnail(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : thumbnail', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).customGET('thumbnail', {
        base64: true
      }));
    }

    /**
     *  @name update
     *  @desc Update a Workgroup Node object
     *  @param {string} workgroupUuid - The uuid of the Workgroup object
     *  @param {string} nodeUuid - The uuid of the Workgroup Node object
     *  @param {Object} workgroupNodeDto - The Workgroup Node object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function update(workgroupUuid, nodeUuid, workgroupNodeDto) {
      $log.debug('workgroupNodesRestService : update', workgroupUuid, nodeUuid, workgroupNodeDto);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).customPUT(workgroupNodeDto));
    }
  }
})();
