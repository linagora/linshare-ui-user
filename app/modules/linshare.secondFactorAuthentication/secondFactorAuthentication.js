(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication', [
      'pascalprecht.translate',
      'linshare.components',
      'linshare.utils',
      'ngclipboard'
    ])
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('secondFactorAuthentication');
    }]);
})();
