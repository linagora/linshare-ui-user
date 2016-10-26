(function() {
  'use strict';

  angular
    .module('linshare.upload')
    .factory('flowUploadService', flowUploadService);

  flowUploadService.$inject = ['$log', 'growlService', 'flowParamsService', 'lsAppConfig'];


  function flowUploadService($log, growlService, flowParamsService, lsAppConfig) {
    return {
      uploadFiles: uploadFiles,
      addUploadedFile: addUploadedFile
    };

    function uploadFiles(files, flowObj, from, folderInfos) {
      addUploadSource(files, from);
      if (from === lsAppConfig.workgroupPage) {
        addUploadSourceFolderInfos(files, folderInfos);
      }
      _.assign(flowObj.defaults.query, flowParamsService.getFlowParams());
    }

    function addUploadSource(files, from) {
      _.forEach(files, function(file) {
        file._from = from;
      });
    }

    function addUploadSourceFolderInfos(files, folderInfos) {
      _.forEach(files, function(file) {
        file.folderInfos = folderInfos;
      });
    }

    function addUploadedFile(flowFile, serverResponse) {
      var response = angular.fromJson(serverResponse);
      if (!response.chunkUploadSuccess) {
        $log.error('Error occured while uploading file :' + response.fileName);
        $log.error('The error message is ' + response.errorMessage);
        growlService.notifyTopCenter('GROWL_ALERT.ERROR.FILE_UPLOAD', 'danger');
      }
      flowFile.linshareDocument = response.entry;
      return flowFile;
    }
  }
})();
