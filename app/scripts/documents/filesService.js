/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .Factory('filesService', function(Restangular){
    return {
      getAllFiles: function(){
        return Restangular.all('').getList();
      },
      getFileInfo: function(){
        return Restangular.get('').one('');
      },
      uploadFiles: function(){

      },
      downloadFiles: function(){

      },
      shareFiles: function(){

      }
    }
  });
