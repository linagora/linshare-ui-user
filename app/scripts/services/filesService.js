/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

angular.module('linshareUiUserApp')
  .factory('filesService', function(Restangular){
    var baseRestDocuments = Restangular.all('documents');
    return {
      getAllFiles: function(){
        return Restangular.all('documents').getList();
      },
      getFileInfo: function(uuid) {
        return Restangular.one('documents', uuid).get();
      },
      downloadFiles: function(uuid){
        return Restangular.all('documents').one(uuid, 'download').get();
      },
      getThumbnail: function(uuid) {
        return Restangular.one('documents', uuid).one('thumbnail').get();
      },
      uploadFiles: function(documentDto){
        return Restangular.all('documents').post(documentDto);
      },
      shareFiles: function(){

      },
      delete: function(uuid) {
        return Restangular.one('documents', uuid).remove();
      }
    };
  });
