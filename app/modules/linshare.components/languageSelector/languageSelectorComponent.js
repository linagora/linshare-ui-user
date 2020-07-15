/**
 * LanguageSelector Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('languageSelector', {
      transclude: true,
      template: require('./languageSelector.html'),
      controller: 'LanguageSelectorController',
      controllerAs: 'LanguageSelectorVm'
    });
})();
