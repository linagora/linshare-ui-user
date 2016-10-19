(function() {
  'use strict';
  angular
    .module('linshare.upload')
    .factory('flowParamsService', flowParamsService);

  function flowParamsService() {
    var workgroupUuid = '';
    var workGroupFolderUuid = '';

    return {
      getFlowParams: getFlowParams,
      setFlowParams: setFlowParams
    };

    function setFlowParams(wu, wfu) {
      workgroupUuid = wu;
      workGroupFolderUuid = wfu;
    }

    function getFlowParams() {
      return {threadUuid: workgroupUuid, workGroupFolderUuid: workGroupFolderUuid};
    }
  }
})();
