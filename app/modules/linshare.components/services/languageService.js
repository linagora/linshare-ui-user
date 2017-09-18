/**
 * languageService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('languageService', languageService);

  languageService.$inject = ['$translate', '$log', 'localStorageService', 'moment', 'tmhDynamicLocale'];

  /**
   * @namespace languageService
   * @desc Service to manipulate language used for translation
   * @memberOf linshare.components
   */
  function languageService($translate, $log, localStorageService, moment, tmhDynamicLocale) {
    var service = {
      changeLocale: changeLocale,
      getLocale: getLocale,
      refreshLocale: refreshLocale
    };

    return service;

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
     * @name changeLocale
     * @desc Change translation to used base on language key
     * @param {string} key - Language key
     * @memberOf linshare.components.languageService
     */
    function changeLocale(key) {
      moment.locale(key);
      tmhDynamicLocale.set(key.substring(0, key.indexOf('-')));
      key = addCountryLocaleCode(key);
      $translate.use(key);
      localStorageService.set('locale', key);
      $log.debug('locale changed to ', key);
    }

    /**
     * @name refreshLocale
     * @desc Refresh local language to use for translation service $translate
     * @memberOf linshare.components.languageService
     */
    function refreshLocale() {
      $translate.refresh(getLocale());
    }

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
  }
})();
