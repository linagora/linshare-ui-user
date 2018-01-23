/**
 * workgroupRestServiceRun
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .run(workgroupRestServiceRun);

  workgroupRestServiceRun.$inject = ['documentModelRestService'];

  /**
   * @namespace workgroupRestServiceRun
   * @desc Run function for extending nodes model
   * @memberOf LinShare.sharedSpace
   */
  function workgroupRestServiceRun(documentModelRestService) {
    documentModelRestService.launchExtendModel('nodes');
  }
})();
