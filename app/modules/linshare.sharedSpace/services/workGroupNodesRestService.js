/**
 * workgroupNodesRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupNodesRestService', workgroupNodesRestService);

  workgroupNodesRestService.$inject = ['_', '$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace workgroupNodesRestService
   * @desc Service to interact with Workgroup Nodes object by REST
   * @memberOf LinShare.sharedSpace
   */
  function workgroupNodesRestService(_, $log, Restangular, ServerManagerService) {
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
        getAudit: getAudit,
        getList: getList,
        remove: remove,
        restangularize: restangularize,
        thumbnail: thumbnail,
        update: update
      };

    activate();

    return service;

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function activate() {
      Restangular.extendModel(restParam, function(model) {
        if (_.isObject(model)) {
          model.getName = function() {
            if (this.lastAuthor.firstName) {
              return this.lastAuthor.firstName + ' ' + this.lastAuthor.lastName;
            } else {
              return this.lastAuthor.mail;
            }
          };
        }
        return model;
      });
    }

    /**
     * @name copy
     * @desc copy a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {object} nodeItem - Node to duplicate
     * @param {string} destinationNodeUuid - The uuid of the Destination Node object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function copy(workgroupUuid, nodeItem, destinationNodeUuid) {
      $log.debug('workgroupNodesRestService : copy', workgroupUuid, nodeItem.uuid, destinationNodeUuid);
      var _destinationNodeUuid = _.isNil(destinationNodeUuid) ? '' : destinationNodeUuid;
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeItem.uuid)
        .all('copy').post(nodeItem, {destinationNodeUuid: _destinationNodeUuid}), errorsMessagesKey);
    }

    /**
     * @name create
     * @desc Create a Workgroup Node object
     * @param {string} workgroupUuid - The id of a Workgroup object
     * @param {object} workgroupFolderDto - The Workgroup Folder object
     * @param {boolean} dryRun - If true, the server returns a fake Node object with unique name
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function create(workgroupUuid, workgroupFolderDto, dryRun) {
      $log.debug('workgroupNodesRestService : create', workgroupUuid, workgroupFolderDto, dryRun);
      return handler(Restangular.one(restUrl, workgroupUuid).all(restParam).post(workgroupFolderDto, {dryRun: dryRun}));
    }

    /**
     * @name download
     * @desc Download a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @returns {string} direct download url of the ressource
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function download(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : download', workgroupUuid, nodeUuid);
      return Restangular.all(restUrl).one(workgroupUuid, restParam).one(nodeUuid, 'download').getRequestedUrl();
    }

    /**
     * @name get
     * @desc Get a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @param {boolean} needTree - If true, add the ancestors of the related folder
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function get(workgroupUuid, nodeUuid, needTree) {
      $log.debug('workgroupNodesRestService : get', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).get({tree: needTree}));
    }

    /**
     * @name getAudit
     * @desc Get audit of a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function getAudit(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : getAudit', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).one('audit').get());
    }

    /**
     * @name getList
     * @desc Get the List of Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} folderUuid - The uuid of a Workgroup Folder object
     * @param {string} nodeType - Type of nodes to get
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function getList(workgroupUuid, folderUuid, nodeType) {
      $log.debug('workgroupNodesRestService : getList', workgroupUuid, folderUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).getList(restParam, {
        parent: folderUuid,
        type: nodeType
      }));
    }

    /**
     * @name remove
     * @desc Remove a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function remove(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : remove', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).remove());
    }

    /**
     * @name restangularize
     * @desc Restangularize an item
     * @param {Object} item - Item to be restangularized
     * @param {String} workgroupUuid - The uuid of a Workgroup object
     * @returns {Object} Restangular object
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function restangularize(item, workgroupUuid) {
      $log.debug('workgroupNodesRestService : restangularize', item, workgroupUuid);
      return Restangular.restangularizeElement(null, item, restUrl + '/' + workgroupUuid + '/' + restParam);
    }

    /**
     * @name thumbnail
     * @desc Get the file thumbnail of a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function thumbnail(workgroupUuid, nodeUuid) {
      $log.debug('workgroupNodesRestService : thumbnail', workgroupUuid, nodeUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeUuid).customGET('thumbnail', {
        base64: true
      }));
    }

    /**
     * @name update
     * @desc Update a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {object} nodeItem - Node to update
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function update(workgroupUuid, nodeItem) {
      $log.debug('workgroupNodesRestService : update', workgroupUuid, nodeItem.uuid, nodeItem);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, nodeItem.uuid).customPUT(nodeItem));
    }
  }
})();
