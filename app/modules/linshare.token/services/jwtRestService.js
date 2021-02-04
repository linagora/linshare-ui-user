angular
  .module('linshare.token')
  .factory('jwtRestService', jwtRestService);

jwtRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

function jwtRestService($log, Restangular, ServerManagerService) {
  const handler = ServerManagerService.responseHandler;

  return {
    list,
    remove
  };

  ////////////

  function list() {
    $log.debug('jwtRestService: list');

    return handler(Restangular.all('jwt').getList());
  }

  function remove(uuid) {
    $log.debug('jwtRestService: remove');

    return handler(Restangular.one('jwt', uuid).remove());
  }
}
