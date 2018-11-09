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
      templateUrl: templateUrl,
      controller: 'LanguageSelectorController',
      controllerAs: 'LanguageSelectorVm'
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.LanguageSelector
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path + 'languageSelector/languageSelector.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
