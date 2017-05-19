/**
 * workgroupEntriesRestService factory
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('workgroupEntriesRestService', workgroupEntriesRestService);

  workgroupEntriesRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace workgroupEntriesRestService
   *  @desc Service to interact with Workgroup Entries object by REST
   *  @memberOf LinShare.sharedSpace
   */
  function workgroupEntriesRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'work_groups',
      restParam = ['entries', 'copy'],
      service = {
        copy: copy,
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
     *  @desc copy a Workgroup Entries object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} entryUuid - The id of the Workgroup Entries object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupEntriesRestService
     */
    function copy(workgroupUuid, entryUuid) {
      $log.debug('workgroupEntriesRestService : copy', workgroupUuid, entryUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(_.join(restParam, '/'), entryUuid).post());
    }

    /**
     *  @name download
     *  @desc Download a Workgroup Entries object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} entryUuid - The id of the Workgroup Entries object
     *  @returns {string} direct download url of the ressource
     *  @memberOf LinShare.sharedSpace.workgroupEntriesRestService
     */
    function download(workgroupUuid, entryUuid) {
      $log.debug('workgroupEntriesRestService : download', workgroupUuid, entryUuid);
      return Restangular.all(restUrl).one(workgroupUuid, restParam[0]).one(entryUuid, 'download').getRequestedUrl();
    }

    /**
     *  @name get
     *  @desc Get a Workgroup Entries object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} entryUuid - The id of the Workgroup Entries object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupEntriesRestService
     */
    function get(workgroupUuid, entryUuid) {
      $log.debug('workgroupEntriesRestService : get', workgroupUuid, entryUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam[0], entryUuid).get());
    }

    /**
     *  @name getList
     *  @desc Get the List of Workgroup Entries object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupEntriesRestService
     */
    function getList(workgroupUuid) {
      $log.debug('workgroupEntriesRestService : getList', workgroupUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).getList(restParam[0]));
    }

    /**
     *  @name remove
     *  @desc Remove a Workgroup Entries object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} entryUuid - The id of the Workgroup Entries object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupEntriesRestService
     */
    function remove(workgroupUuid, entryUuid) {
      $log.debug('workgroupEntriesRestService : remove', workgroupUuid, entryUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam[0], entryUuid).remove());
    }

    /**
     *  @name thumbnail
     *  @desc Get the file thumbnail of a Workgroup Entries object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} entryUuid - The id of the Workgroup Entries object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupEntriesRestService
     */
    function thumbnail(workgroupUuid, entryUuid) {
      $log.debug('workgroupEntriesRestService : thumbnail', workgroupUuid, entryUuid);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam[0], entryUuid).customGET('thumbnail', {
        base64: true
      }));
    }

    /**
     *  @name update
     *  @desc Update a Workgroup Entries object
     *  @param {String} workgroupUuid - The id of the Workgroup object
     *  @param {String} entryUuid - The id of the Workgroup Entries object
     *  @param {Object} workgroupEntryDto - The Workgroup Entries object
     *  @returns {Promise} server response
     *  @memberOf LinShare.sharedSpace.workgroupEntriesRestService
     */
    function update(workgroupUuid, entryUuid, workgroupEntryDto) {
      $log.debug('workgroupEntriesRestService : update', workgroupUuid, entryUuid, workgroupEntryDto);
      return handler(Restangular.one(restUrl, workgroupUuid).one(restParam[0], entryUuid).customPUT(workgroupEntryDto));
    }
  }
})();
