/**
 * LanguageSelector Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('LanguageSelectorController', LanguageSelectorController);

  LanguageSelectorController.$inject = [
    'languageService',
    'lsAppConfig'
  ];

  function LanguageSelectorController(
    languageService,
    lsAppConfig
  ) {
    /* jshint validthis: true */
    const languageSelectorVm = this;

    languageSelectorVm.$onInit = $onInit;
    languageSelectorVm.changeLanguage = changeLanguage;
    languageSelectorVm.languages = lsAppConfig.languages;

    ////////////

    /**
     * @name $onInit
     * @desc Initialization function of the component
     * @namespace linshare.components.languageSelector
     */
    function $onInit() {
      const locale = languageService.getLocale();

      languageSelectorVm.currentLanguage = locale;
    }

    /**
     * @name changeLanguage
     * @desc Change language
     * @param {@link Language} language - Language selected
     * @namespace linshare.components.languageSelector
     */
    function changeLanguage(language) {
      languageService.changeLocale(language);

      languageSelectorVm.currentLanguage = language;
    }
  }
})();
