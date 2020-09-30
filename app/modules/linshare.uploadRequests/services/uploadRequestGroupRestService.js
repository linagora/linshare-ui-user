/**
 * uploadRequestGroupRestService factory
 * @namespace LinShare.uploadRequests
 */
angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestGroupRestService', uploadRequestGroupRestService);

uploadRequestGroupRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

/**
 *  @namespace uploadRequestGroupRestService
 *  @desc Service to interact with UploadRequestGroup object by REST
 *  @memberof LinShare.uploadRequests
 */
function uploadRequestGroupRestService($log, Restangular, ServerManagerService) {
  const
    handler = ServerManagerService.responseHandler,
    restUrl = 'upload_request_groups';

  return {
    create: create,
    get: get,
    list: list,
    remove: remove,
    update: update,
    updateStatus: updateStatus,
    listUploadRequests: listUploadRequests
  };;

  ////////////

  /**
   *  @name create
   *  @desc create a UploadRequest object
   *  @param {object} uploadRequestdto - The UploadRequest object
   *  @param {object} options - The UploadRequest options. Mostly contains query for request
   *  @returns {promise} server response
   *  @memberof linshare.uploadRequests.uploadRequestGroupRestService
   */
  function create(uploadRequestDto, options) {
    $log.debug('uploadRequestGroupRestService : create', uploadRequestDto);

    return handler(Restangular.all(restUrl).post(uploadRequestDto, { groupMode: !!options.groupMode }));
  }

  /**
   *  @name get
   *  @desc Get a uploadRequest object
   *  @param {String} uuid - The id of the UploadRequest object
   *  @returns {Promise} server response
   *  @memberof LinShare.uploadRequests.uploadRequestGroupRestService
   */
  function get(uuid) {
    $log.debug('uploadRequestGroupRestService : get', uuid);

    return handler(Restangular.all(restUrl).one(uuid).get());
  }

  /**
   *  @name list
   *  @desc Get list of the uploadRequest object
   *  @param {Boolean} allUploadRequest - Query param value for requesting all uploadRequest or not
   *  @returns {Promise} server response
   *  @memberof LinShare.uploadRequests.uploadRequestGroupRestService
   */
  function list(status) {
    $log.debug('uploadRequestGroupRestService : list', status);

    return handler(Restangular
      .all(restUrl)
      .getList({ status })
      .then(Restangular.stripRestangular));
  }

  /**
   *  @name remove
   *  @desc remove a UploadRequest object
   *  @param {object} uploadRequestdto - The UploadRequest object
   *  @returns {promise} server response
   *  @memberof linshare.uploadRequests.uploadRequestGroupRestService
   */
  function remove(uploadRequestDto) {
    $log.debug('uploadRequestGroupRestService : remove', uploadRequestDto);

    return handler(Restangular.one(restUrl, uploadRequestDto.uuid).remove());
  }

  /**
   *  @name updateUploadRequest
   *  @desc Update a uploadRequest object
   *  @param {String} uuid - The id of the UploadRequest object
   *  @param {Object} uploadRequestDto - The UploadRequest object
   *  @returns {promise} server response
   *  @memberOf LinShare.uploadRequests.uploadRequestGroupRestService
   */
  function update(uuid, uploadRequestDto) {
    $log.debug('uploadRequestGroupRestService : update', uuid, uploadRequestDto);

    return handler(Restangular.one(restUrl, uuid).customPUT(uploadRequestDto));
  }

  function updateStatus(uuid, status) {
    $log.debug('LinshareUploadRequestService : updateStatus', uuid, status);

    return handler(Restangular.one(restUrl, uuid).one('status', status).put());
  }

  function listUploadRequests(uuid) {
    $log.debug('uploadRequestGroupRestService : listUploadRequests', uuid);

    return handler(Restangular.one(restUrl, uuid).getList('upload_requests'));
  }
}
