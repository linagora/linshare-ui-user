/**
 * Created by Alpha O. Sall on June 15th, 2016.
 */
'use strict';

angular.module('linshare.components')

  // =========================================================================
  // LANGUAGE SERVICE - GET USED LANGUAGE ET CHANGE LANGUAGE
  // =========================================================================
  .factory('languageService', ['$translate', '$log', 'localStorageService', function($translate, $log, localStorageService) {
    return {
      getLocale: function() {
        var storedLocale = localStorageService.get('locale');
        return storedLocale ? storedLocale : $translate.use();
      },
      changeLocale: function(key) {
        key = addCountryLocaleCode(key);
        $translate.use(key);
        localStorageService.set('locale', key);
        $log.debug('locale changed to ', key);
      },
      refreshLocale: function() {
        $translate.refresh();
      }
    };

    function addCountryLocaleCode(key) {
      if(key.indexOf('-') === -1) {
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
  }]);
