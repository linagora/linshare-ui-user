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
      restUrl = {
        documents: 'documents',
        workgroup: 'shared_spaces'
      },
      restParam = 'nodes',
      service = {
        copy,
        copyToMySpace,
        create,
        download,
        metadata,
        get,
        getAudit,
        getList,
        remove,
        restangularize,
        restangularizeCollection,
        search,
        thumbnail,
        update
      };

    activate();

    return service;

    ////////////

    /**
     * The Workgroup Node object.
     * @typedef {Object} WorkgroupNode
     * @type {String} key - WorkgroupNode uuid
     * @type {String} type - The type of the WorkgroupNode either FOLDER|DOCUMENT|DOCUMENT_REVISION
     * @type {String} name - The name of the WorkgroupNode
     * @type {String} parent - The uuid of the parent WorkgroupNode
     * @type {String} workGroup - The uuid of the Workgroup
     * @type {String} description - The WorkgroupNode description
     * @type {Object} metadata - The WorkgroupNode metadata
     * @type {Object} lastAuthor - The user that did the last modification
     * @type {Date} creationDate - The Date of creation of the WorkgroupNode
     * @type {String} modificationDate - The last modification date
     * @type {number} size - The WorkgroupNode size in bytes
     * @type {String} mimeType - The mime type of the WorkGroupNode
     * @type {String} sha256sum - The mime type of the WorkGroupNode
     * @type {Date} uploadDate - The date of the WorkgroupNode upload
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */


    /**
     * @name activate
     * @desc Activation function of the service, launch at every instantiation
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
     * @param {object} nodeItemUuid - The uuid of the Node to copy
     * @param {string} destinationNodeUuid - The uuid of the Destination Node object
     * @param {string} kind - Source where the copy comes from
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function copy(workgroupUuid, nodeItemUuid, destinationNodeUuid, kind) {
      $log.debug('workgroupNodesRestService : copy', workgroupUuid, nodeItemUuid, destinationNodeUuid);
      var _destinationNodeUuid = _.isNil(destinationNodeUuid) ? '' : destinationNodeUuid;
      var _kind = _.isNil(kind) ? 'SHARED_SPACE' : kind;


      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, _destinationNodeUuid)
        .all('copy').post({
          kind: _kind,
          uuid: nodeItemUuid,
          contextUuid: kind === 'SHARED_SPACE' ? workgroupUuid : ''
        }), errorsMessagesKey);
    }

    /**
     * @name copyToMySpace
     * @desc copy a Workgroup Node object into My Space
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {object} nodeItemUuid - The uuid of the Node to copy
     * @returns {Promise} server response
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function copyToMySpace(workgroupUuid, nodeItemUuid) {
      $log.debug('workgroupNodesRestService : copyToMySpace', workgroupUuid, nodeItemUuid);

      return handler(Restangular.one(restUrl.documents).all('copy').post({
        kind: 'SHARED_SPACE',
        uuid: nodeItemUuid,
        contextUuid: workgroupUuid
      }));
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

      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).all(restParam).post(workgroupFolderDto, {
        dryRun: dryRun
      }));
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

      return Restangular.all(restUrl.workgroup).one(workgroupUuid, restParam).one(nodeUuid, 'download')
        .getRequestedUrl();
    }

    /**
     * The Workgroup Node metadata object.
     * @typedef {Object} WorkgroupNodeMetadata
     * @type {String} count - Number of child nodes
     * @type {String} size - Size in byte of the node
     * @type {String} type - The type of the WorkgroupNode either DOCUMENT|DOCUMENT_REVISION
     * @type {String} uuid - WorkgroupNode uuid
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */

    /**
     * @name metadata
     * @desc Get the metadata details of a Workgroup Node object
     * @param {string} workgroupUuid - The uuid of the Workgroup object
     * @param {string} nodeUuid - The uuid of the Workgroup Node object
     * @param {string} withStorageSize - Define if the storage size should be computed
                                         Storage size is the real size used on the hard drive
     * @returns {Promise<WorkgroupNodeMetadata>} - The {@link WorkgroupNodeMetadata} object
     * @memberOf LinShare.sharedSpace.workgroupNodesRestService
     */
    function metadata(workgroupUuid, nodeUuid, withStorageSize) {
      $log.debug('workgroupNodesRestService : detail', workgroupUuid, nodeUuid);

      return handler(Restangular.all(restUrl.workgroup).one(workgroupUuid, restParam).one(nodeUuid, 'metadata').get({
        storage: withStorageSize
      }));
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

      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, nodeUuid).get({tree: needTree}));
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

      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, nodeUuid).one('audit').get());
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

      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).getList(restParam, {
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

      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, nodeUuid).remove());
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

      return Restangular.restangularizeElement(null, item, restUrl.workgroup + '/' + workgroupUuid + '/' + restParam);
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

      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, nodeUuid).one('thumbnail').get({
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

      return handler(Restangular.one(restUrl.workgroup, workgroupUuid).one(restParam, nodeItem.uuid)
        .customPUT(nodeItem));
    }


    function restangularizeCollection(items, parent) {
      return Restangular.restangularizeCollection(parent, items, restParam);
    }

    function search(workgroupUuid, params) {
      $log.debug('workgroupNodesRestService : search', workgroupUuid, params);

      return handler(Restangular
        .one(restUrl.workgroup, workgroupUuid)
        .all(restParam).one('search')
        .get(params)
        .then(response => {
          response.data = Restangular.restangularizeCollection(response.parentResource.parentResource, response.data, restParam, true);

          return response;
        })
      );
    }
  }
})();
