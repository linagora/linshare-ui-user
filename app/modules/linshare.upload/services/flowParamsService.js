(function() {
  'use strict';
  angular
    .module('linshare.upload')
    .factory('flowParamsService', flowParamsService);

  function flowParamsService() {
    var workgroupUuid = '';
    var workgroupFolderUuid = '';

    return {
      getFlowParams: getFlowParams,
      setFlowParams: setFlowParams
    };

    function setFlowParams(wu, wfu) {
      workgroupUuid = wu;
      workgroupFolderUuid = wfu;
    }

    function getFlowParams() {
      return {threadUuid: workgroupUuid, workGroupFolderUuid: workgroupFolderUuid};
    }
  }
})();
