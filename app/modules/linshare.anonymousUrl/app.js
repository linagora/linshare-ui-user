/**
 * @file Angular module declaration for AnonymousUrl
 * @copyright LINAGORA © 2009–2019
 * @license AGPL-3.0
 * @module LinShare.anonymousUrl
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
