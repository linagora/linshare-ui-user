angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestRestService', uploadRequestRestService);

uploadRequestRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

function uploadRequestRestService($log, Restangular, ServerManagerService) {
  const handler = ServerManagerService.responseHandler;

  return {
    get,
    getAudit,
    listEntries,
    update,
    updateStatus
  };;

  ////////////

  function get(uuid) {
    $log.debug('uploadRequestRestService: get', uuid);

    return handler(Restangular.one('upload_requests', uuid).get());
  }

  function listEntries(uuid) {
    $log.debug('uploadRequestRestService: listEntries', uuid);

    return handler(Restangular.one('upload_requests', uuid).getList('entries'));
  }

  function updateStatus(uuid, status, query) {
    $log.debug('uploadRequestRestService: updateStatus');

    return handler(Restangular.one('upload_requests', uuid).one('status', status).put(query));
  }

  function update(uuid, uploadRequestDto) {
    $log.debug('uploadRequestRestService: update');

    return handler(Restangular.one('upload_requests', uuid).customPUT(uploadRequestDto));
  }

  function getAudit(uuid) {
    $log.debug('uploadRequestRestService: getAudit, uuid');

    return handler(Restangular.one('upload_requests', uuid).getList('audit'));
  }
}
