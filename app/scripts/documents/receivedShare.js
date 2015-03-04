/**
 * Created by vagrant on 3/4/15.
 */
/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .factory('receivedShare', function(Restangular){
    return {
      getAllFiles: function(){
        return Restangular.all('receivedShares').getList();
      }
    };
  });
