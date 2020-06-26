(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication', [
      'pascalprecht.translate',
      'linshare.components',
      'ngclipboard'
    ])
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('secondFactorAuthentication');
    }]);
})();
