angular
  .module('linshare.token')
  .factory('jwtRestService', jwtRestService);

jwtRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

function jwtRestService($log, Restangular, ServerManagerService) {
  const handler = ServerManagerService.responseHandler;

  return {
    list,
    remove,
    create,
    update
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

  function create(payload) {
    $log.debug('jwtRestService: create');

    return handler(Restangular.all('jwt').post(payload));
  }

  function update(payload, uuid) {
    $log.debug('jwtRestService: create');

    return handler(Restangular.one('jwt', uuid).customPUT(payload));
  }
}
