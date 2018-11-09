/**
 * languageService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('languageService', languageService);

  languageService.$inject = [
    '$log',
    '$translate',
    'localStorageService',
    'lsAppConfig',
    'moment'
  ];

  /**
   * @namespace languageService
   * @desc Service to manipulate language used for translation
   * @memberOf linshare.components
   */
  function languageService(
    $log,
    $translate,
    localStorageService,
    lsAppConfig,
    moment
  )
  {
    var service = {
      changeLocale: changeLocale,
      getLocale: getLocale,
      refreshLocale: refreshLocale
    };

    return service;

    /**
     * The Language object.
     * @typedef {Object} language
     * @property {String} key - the ISO 639-1 Code of the language
     * @property {String} fullKey - the ISO 639-1 Code of the language & ISO 3166-2 code separated by `-`
     * @property {String} country - Full name of the country in the corresponding language
     */

    /**
     * @name changeLocale
     * @desc Change translation to used base on language key
     * @param {@link Language} language - Language object
     * @return {Promise}
     * @memberOf linshare.components.languageService
     */
    function changeLocale(language) {
      localStorageService.set('locale',language);
      moment.locale(language.fullKey);
      $translate.use(language.fullKey);
      $log.debug('locale changed to ', language.fullKey);
    }

    /**
     * @name getLocale
     * @desc Get current language used stocked in the local storage
     * @memberOf linshare.components.languageService
     */
    function getLocale() {
      var storedLocale = localStorageService.get('locale');

      return storedLocale ? storedLocale : lsAppConfig.language.en;
    }

    /**
     * @name refreshLocale
     * @desc Refresh local language to use for translation service $translate
     * @memberOf linshare.components.languageService
     */
    function refreshLocale() {
      $translate.refresh(getLocale());
    }
  }
})();
