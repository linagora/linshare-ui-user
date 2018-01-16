/**
 * receivedShareRestServiceRun
 * @namespace LinShare.receivedShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.receivedShare')
    .run(receivedShareRestServiceRun);

  receivedShareRestServiceRun.$inject = ['documentModelRestService'];

  /**
   * @namespace receivedShareRestServiceRun
   * @desc Run function for extending received_share model
   * @memberOf LinShare.receivedShare
   */
  function receivedShareRestServiceRun(documentModelRestService) {
    documentModelRestService.launchExtendModel('received_shares');
  }
})();
