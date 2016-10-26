(function() {
  'use strict';

  angular
    .module('linshare.document')
    .factory('documentRestService', documentRestService);

  documentRestService.$inject = ['Restangular', '$log'];

  function documentRestService(Restangular, $log) {
    var baseRestDocuments = Restangular.all('documents');

    return {
      getAllFiles: getAllFiles,
      get: get,
      downloadFile: downloadFile,
      getThumbnail: getThumbnail,
      uploadFiles: uploadFiles,
      deleteFile: deleteFile,
      autocomplete: autocomplete,
      update: update,
      updateFile: updateFile
    };

    function getAllFiles() {
      $log.debug('documentRestService:getAllFiles');
      return baseRestDocuments.getList();
    }

    function get(uuid) {
      $log.debug('documentRestService:get a File details');
      return Restangular.one('documents', uuid).get({withShares: true});
    }

    function downloadFile(uuid) {
      $log.debug('documentRestService:downloadFiles');
      return Restangular.all('documents').one(uuid, 'download').withHttpConfig({responseType: 'arraybuffer'}).get();
    }

    function getThumbnail(uuid) {
      $log.debug('documentRestService:getThumbnail');
      return Restangular.one('documents', uuid).one('thumbnail').get({base64: true});
    }

    function uploadFiles(documentDto) {
      $log.debug('documentRestService:uploadFiles');
      return Restangular.all('documents').post(documentDto);
    }

    function deleteFile(uuid) {
      $log.debug('documentRestService:deleteFiles');
      return Restangular.one('documents', uuid).remove();
    }

    function autocomplete(pattern) {
      $log.debug('documentRestService:autocomplete');
      return Restangular.all('users').one('autocomplete', pattern).get();
    }

		/**
     * Call to the rest api for updating a Document
     * @param uuid
     * @param documentDto
     * @returns {*}
     */
    function update (uuid, documentDto) {
      $log.debug('LinshareDocumentRestService : updating a document');
      var documentUpdated = _.cloneDeep(documentDto);
      if (documentUpdated.thumbnail) {
        delete documentUpdated.thumbnail;
      }
      return Restangular.one('documents', uuid).customPUT(documentUpdated);
    }

    function updateFile(uuid, documentDto) {
      $log.debug('documentRestService updating a document');
      return Restangular.all('documents').one(uuid).post(documentDto);
    }
  }
})();
