/**
 * documentRestServiceRun
 * @namespace LinShare.document
 */
(function() {
  'use strict';

  angular
    .module('linshare.document')
    .run(documentRestServiceRun);

  documentRestServiceRun.$inject = ['documentModelRestService'];

  /**
   * @namespace documentRestServiceRun
   * @desc Run function for extending documents model
   * @memberOf LinShare.document
   */
  function documentRestServiceRun(documentModelRestService) {
    documentModelRestService.launchExtendModel('documents');
  }
})();
