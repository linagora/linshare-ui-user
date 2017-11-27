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
    '$locale',
    '$log',
    '$translate',
    'localStorageService',
    'moment',
    'tmhDynamicLocale',
    'uibDatepickerPopupConfig'
  ];

  /**
   * @namespace languageService
   * @desc Service to manipulate language used for translation
   * @memberOf linshare.components
   */
  function languageService(
    $locale,
    $log,
    $translate,
    localStorageService,
    moment,
    tmhDynamicLocale,
    uibDatepickerPopupConfig
  )
  {
    var service = {
      changeLocale: changeLocale,
      getLocale: getLocale,
      refreshLocale: refreshLocale
    };

    return service;

    /**
     * @name addCountryLocaleCode
     * @desc Return correct key name
     * @param {string} key - Language key
     * @returns {string} Language key
     * @memberOf linshare.components.languageService
     */
    function addCountryLocaleCode(key) {
      if (key.indexOf('-') === -1) {
        switch (key) {
          case 'fr':
            key += '-FR';
            break;
          case 'en':
            key += '-US';
            break;
          case 'vi':
            key += '-VN';
            break;
          default:
            key = 'en-US';
        }
      }
      return key;
    }

    /**
     * @name changeLocale
     * @desc Change translation to used base on language key
     * @param {string} key - Language key
     * @memberOf linshare.components.languageService
     */
    function changeLocale(key) {
      var keyWithCountryLocaleCode = addCountryLocaleCode(key);

      moment.locale(keyWithCountryLocaleCode);
      tmhDynamicLocale
        .set(keyWithCountryLocaleCode.substring(0, keyWithCountryLocaleCode.indexOf('-')))
        .then(overrideDatepickerFormat);
      $translate.use(keyWithCountryLocaleCode);
      localStorageService.set('locale', keyWithCountryLocaleCode);
      $log.debug('locale changed to ', keyWithCountryLocaleCode);
    }

    /**
     * @name getLocale
     * @desc Get current language used stocked in the local storage
     * @memberOf linshare.components.languageService
     */
    function getLocale() {
      var storedLocale = localStorageService.get('locale');

      return storedLocale ? storedLocale : $translate.use();
    }

    /**
     * @name overrideDatepickerFormat
     * @desc Override default date formats in uibDatepickerPopup
     * @memberOf linshare.components.languageService
     */
    // TODO : Decorator in run.js
    function overrideDatepickerFormat() {
      uibDatepickerPopupConfig.datepickerPopup = $locale.DATETIME_FORMATS.shortDate;
      uibDatepickerPopupConfig.html5Types.date = $locale.DATETIME_FORMATS.shortDate;
      uibDatepickerPopupConfig.html5Types['datetime-local'] = $locale.DATETIME_FORMATS.medium;
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
