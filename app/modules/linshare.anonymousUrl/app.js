/**
 * LinShare.anonymousUrl Module
 * @namespace LinShare
 */
(function() {
  'use strict';

  angular
    .module(
      'linshare.anonymousUrl',
      [
        'ngResource',
        'ngRoute',
        'ui.router',
        'ui.bootstrap',
        'pascalprecht.translate'
      ]);
})();

require('./constants');
require('./route');
require('./controllers/anonymousHomeController');
require('./controllers/anonymousUrlController');
require('./directives/anonymous-url-template.directive');
require('./services/anonymousUrlService');
