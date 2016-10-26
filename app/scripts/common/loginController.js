/**
 * Created by Alpha Sall on June 14th, 2016.
 */

'use strict';

angular.module('linshareUiUserApp')
.controller('loginController', ['$rootScope', 'AuthenticationService', 'languageService',
  function($rootScope, AuthenticationService, languageService) {

    this.email = '';
    this.password = '';

    var locale = languageService.getLocale();
    var splitLocale = function(locale) {
      locale = locale.split('-');
      var language = locale[0];
      var country;
      if (locale.length > 1) {
        country = locale[1].toLowerCase();
      }
      return {language: language, country: country};
    };
    this.loginLocale = splitLocale(locale);

    this.submitForm = function() {
      AuthenticationService.login(this.email, this.password);
    };

    this.changeLoginLanguage = function(lang) {
      languageService.changeLocale(lang);
      this.loginLocale = splitLocale(lang);
    };

}]);
