/**
 * sharedSpaceRestServiceRun
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .run(sharedSpaceRestServiceRun);

  sharedSpaceRestServiceRun.$inject = ['documentModelRestService'];

  /**
   * @namespace sharedSpaceRestServiceRun
   * @desc Run function for extending nodes model
   * @memberOf LinShare.sharedSpace
   */
  function sharedSpaceRestServiceRun(documentModelRestService) {
    documentModelRestService.launchExtendModel('nodes');
  }
})();
