/**
 * workgroupFoldersRestService
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupFoldersRestService', workgroupFoldersRestService);

  workgroupFoldersRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace workgroupFoldersRestService
   *  @descService to interact with Workgroup Folder object by REST 
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupFoldersRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'work_groups',
      restParam = 'folders',
      service = {
        create: create,
        get: get,
        getList: getList,
        getParent: getParent,
        remove: remove,
        update: update
      };

    return service;

    ////////////

    /**
     *  @name create
     *  @desc Create a Workgroup Folder object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @param {Object} workgroupFolderDto - The Workgroup Folder object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupFoldersRestService
     */
    function create(workgroupUuid, workgroupFolderDto) {
      $log.debug('workgroupFoldersRestService : create', workgroupUuid, workgroupFolderDto);
      return handler(Restangular.one(restUrl, workgroupUuid).all(restParam).post(workgroupFolderDto));
    }

    /**
     *  @name get
     *  @desc Get a Workgroup Folder object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @param {String} folderUuid - The id of a Workgroup Folder object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupFoldersRestService
     */
    function get(workgroupUuid, folderUuid) {
      $log.debug('workgroupFoldersRestService : get', workgroupUuid, folderUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, folderUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the list of Workgroup Folder object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupFoldersRestService
     */
    function getList(workgroupUuid) {
      $log.debug('workgroupFoldersRestService : getList', workgroupUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).getList(restParam));
    }

    /**
     *  @name getParent
     *  @desc Get the parent of a Workgroup Folder object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @param {String} folderUuid - The id of a Workgroup Folder object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupFoldersRestService
     */
    function getParent(workgroupUuid, folderUuid) {
      $log.debug('workgroupFoldersRestService : getParent', workgroupUuid, folderUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).getList(restParam, {
        parent: folderUuid
      }));
    }

    /**
     *  @name remove
     *  @desc Remove a Workgroup Folder object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @param {String} folderUuid - The id of a Workgroup Folder object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupFoldersRestService
     */
    function remove(workgroupUuid, folderUuid) {
      $log.debug('workgroupFoldersRestService : remove', workgroupUuid, folderUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam, folderUuid).remove());
    }

    /**
     *  @name update
     *  @desc Update a Workgroup Folder object
     *  @param {String} workgroupUuid - The id of a Workgroup object
     *  @param {Object} workgroupFolderDto - The Workgroup Folder object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupFoldersRestService
     */
    function update(workgroupUuid, workgroupFolderDto) {
      $log.debug('workgroupFoldersRestService : updateFolder', workgroupUuid, workgroupFolderDto);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam).customPUT(workgroupFolderDto));
    }
  }
})();
