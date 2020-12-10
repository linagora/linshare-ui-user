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
    addRecipients,
    create,
    get,
    getDownloadEntriesUrl,
    list,
    listUploadRequests,
    update,
    updateStatus
  };

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

    return handler(Restangular.all(restUrl).post(uploadRequestDto, { collective: !!options.collective }));
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

  function updateStatus(uuid, status, query) {
    $log.debug('LinshareUploadRequestService : updateStatus', uuid, status);

    return handler(Restangular.one(restUrl, uuid).one('status', status).put(query));
  }

  function listUploadRequests(uuid) {
    $log.debug('uploadRequestGroupRestService : listUploadRequests', uuid);

    return handler(Restangular.one(restUrl, uuid).getList('upload_requests'));
  }

  function addRecipients(uuid, payload) {
    $log.debug('uploadRequestGroupRestService : addRecipients', uuid, payload);

    return handler(Restangular.one(restUrl, uuid).post('recipients', payload));
  }

  function getDownloadEntriesUrl(uuid, uploadRequestUuid) {
    $log.debug('uploadRequestEntryRestService : getDownloadEntriesUrl', uuid, uploadRequestUuid);

    const url =  Restangular.one(restUrl, uuid).one('download').getRestangularUrl();

    return uploadRequestUuid ? `${url}?requestUuid=${uploadRequestUuid}` : url;
  }
}
