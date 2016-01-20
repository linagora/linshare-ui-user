'use strict';

angular.module('linshareUiUserApp')
  .factory('LinshareFunctionalityService', function(Restangular, $log, $q) {
    var allFunctionalities = {};
    var deferred = $q.defer();
    return {
      getAll: function() {
        $log.debug('Functionality:getAll');
        return Restangular.all('functionalities').getList().then(function(allfunc) {
          angular.forEach(allfunc, function(elm) {
            allFunctionalities[elm.identifier] = elm;
          });
          deferred.resolve(allFunctionalities);
          return deferred.promise;
        });
      },
      get: function(funcId) {
        $log.debug('Functionality:get');
        return Restangular.one('functionalities').get(funcId);
      }
    };
  });
