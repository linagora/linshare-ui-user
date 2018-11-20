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
