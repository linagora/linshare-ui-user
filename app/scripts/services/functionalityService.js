'use strict';

angular.module('linshareUiUserApp')
  .factory('LinshareFunctionalityService', function(Restangular, $log, $q) {
    var allFunctionalities = {};
    var deferred = $q.defer();
    Restangular.all('functionalities').getList().then(function(allfunc) {
      angular.forEach(allfunc, function(elm) {
        var func = {};
        func[elm.identifier] = elm;
        angular.extend(allFunctionalities, func);
      });
      deferred.resolve(allFunctionalities);
    }, function(err) {
      $log.error('error getting all functionalities', err);
    });
    return {
      getAll: function() {
        $log.debug('Functionality:getAll');
        return deferred.promise;
      },
      get: function(funcId) {
        $log.debug('Functionality:get');
        return Restangular.all('functionalities').one(funcId).get();
      },
      getFunctionalityParams: function(key) {
        return this.getAll().then(function(all) {
          return all[key];
        });
      }
    };
  });
