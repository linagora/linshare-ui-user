/**
 * Safe Details Module
 * @namespace SafeDetails
 * @memberOf LinShare
 */
(function () {
  'use strict';

  angular.module(
    'linshare.safeDetails',
    [
      'restangular',
      'pascalprecht.translate',
    ]
  );
})();

require('./services/safeDetailsRestService');
require('./controllers/SafeDetailsController');