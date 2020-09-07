/**
 * uploadRequestRestService factory
 * @namespace LinShare.uploadRequests
 */
angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestRestService', uploadRequestRestService);

uploadRequestRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

/**
 *  @namespace uploadRequestRestService
 *  @desc Service to interact with UploadRequest object by REST
 *  @memberof LinShare.uploadRequests
 */
function uploadRequestRestService($log, Restangular, ServerManagerService) {
  const
    handler = ServerManagerService.responseHandler,
    restUrl = 'upload_request_groups';

  return {
    create: create,
    get: get,
    getList: getList,
    remove: remove,
    update: update
  };;

  ////////////

  /**
   *  @name create
   *  @desc create a UploadRequest object
   *  @param {object} uploadRequestdto - The UploadRequest object
   *  @param {object} options - The UploadRequest options. Mostly contains query for request
   *  @returns {promise} server response
   *  @memberof linshare.uploadRequests.LinshareuploadRequestservice
   */
  function create(uploadRequestDto, options) {
    $log.debug('LinshareUploadRequestService : create', uploadRequestDto);
    return handler(Restangular.all(restUrl).post(uploadRequestDto, { groupMode: !!options.groupMode }));
  }

  /**
   *  @name get
   *  @desc Get a uploadRequest object
   *  @param {String} uuid - The id of the UploadRequest object
   *  @returns {Promise} server response
   *  @memberof LinShare.uploadRequests.uploadRequestRestService
   */
  function get(uuid) {
    $log.debug('LinshareUploadRequestService : get', uuid);
    return handler(Restangular.all(restUrl).one(uuid).get());
  }

  /**
   *  @name getList
   *  @desc Get list of the uploadRequest object
   *  @param {Boolean} allUploadRequest - Query param value for requesting all uploadRequest or not
   *  @returns {Promise} server response
   *  @memberof LinShare.uploadRequests.uploadRequestRestService
   */
  function getList(allUploadRequest) {
    $log.debug('LinshareUploadRequestService : getList', allUploadRequest);
    return handler(Restangular.all(restUrl).getList({'mine': allUploadRequest}));
  }

  /**
   *  @name remove
   *  @desc remove a UploadRequest object
   *  @param {object} uploadRequestdto - The UploadRequest object
   *  @returns {promise} server response
   *  @memberof linshare.uploadRequests.linshareuploadRequestservice
   */
  function remove(uploadRequestDto) {
    $log.debug('LinshareUploadRequestService : remove', uploadRequestDto);
    return handler(Restangular.one(restUrl, uploadRequestDto.uuid).remove());
  }

  /**
   *  @name updateUploadRequest
   *  @desc Update a uploadRequest object
   *  @param {String} uuid - The id of the UploadRequest object
   *  @param {Object} uploadRequestDto - The UploadRequest object
   *  @returns {promise} server response
   *  @memberOf LinShare.uploadRequests.uploadRequestRestService
   */
  //TODO: the put should be on uploadRequests/{uuid}, to be corrected B&F
  function update(uuid, uploadRequestDto) {
    $log.debug('LinshareUploadRequestService : update', uuid, uploadRequestDto);
    return handler(Restangular.one(restUrl, uuid).customPUT(uploadRequestDto));
  }
}
