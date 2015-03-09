'use strict';

angular.module('linshareUiUserApp')
  .factory('ThreadService', function(Restangular){
    return {
      getAll: function(){
        return Restangular.all('threads').getList();
      },
      create: function(threadDto){
        return Restangular.all('threads').post(threadDto);
      }
    }
  });
