/**
 * Upload Module
 * @namespace Upload
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular
    .module(
      'linshare.upload',
      [
        'flow',
        'restangular',
        'ngTable',
        'linshare.components',
        'pascalprecht.translate',
      ]);
})();

require('./constants');
require('./controllers/uploadQueueController');
require('./directives/lsUploadQueue/lsUploadQueueDirective');
require('./services/flowUploadService');
require('./services/uploadRestService');