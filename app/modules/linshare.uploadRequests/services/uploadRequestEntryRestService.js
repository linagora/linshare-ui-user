angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestEntryRestService', uploadRequestEntryRestService);

uploadRequestEntryRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

function uploadRequestEntryRestService($log, Restangular, ServerManagerService) {
  const handler = ServerManagerService.responseHandler;

  return {
    getAudit,
    getDownloadUrl,
    remove,
    thumbnail
  };

  ////////////

  function getDownloadUrl(uuid) {
    $log.debug('uploadRequestEntryRestService : getDownloadUrl', uuid);

    return Restangular.all('upload_request_entries').one(uuid, 'download').getRequestedUrl();
  }

  function remove(uuid) {
    $log.debug('uploadRequestEntryRestService : remove', uuid);

    return handler(Restangular.all('upload_request_entries').one(uuid).remove());
  }

  function getAudit(uuid) {
    $log.debug('uploadRequestEntryRestService : getAudit', uuid);

    return handler(Restangular.all('upload_request_entries').one(uuid, 'audit').get());
  }

  function thumbnail(uuid) {
    $log.debug('uploadRequestEntryRestService : thumbnail', uuid);

    return Restangular.all('upload_request_entries').one(uuid, 'thumbnail').get({
      base64: true
    });
  }
}
