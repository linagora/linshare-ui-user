angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestRestService', uploadRequestRestService);

uploadRequestRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

function uploadRequestRestService($log, Restangular, ServerManagerService) {
  const handler = ServerManagerService.responseHandler;

  return {
    get,
    listEntries
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
}
