angular
  .module('linshare.uploadRequests')
  .factory('uploadRequestEntryRestService', uploadRequestEntryRestService);

uploadRequestEntryRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

function uploadRequestEntryRestService($log, Restangular) {
  return {
    getDownloadUrl
  };

  ////////////

  function getDownloadUrl(uuid) {
    $log.debug('uploadRequestEntryRestService : getDownloadUrl', uuid);

    return Restangular.all('upload_request_entries').one(uuid, 'download').getRequestedUrl();
  }
}
