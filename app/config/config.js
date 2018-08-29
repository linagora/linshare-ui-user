/**
 * lsUserConfig Constant
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .constant('lsUserConfig', {
      baseRestUrl: 'linshare/webservice/rest/user/v2',
      // The debug mode, allow to get more information while doing any interraction in the APP.
      // It is recommended to set it to 'true' when having any trouble for reporting information
      // from the browser console to your software vendor
      debug: true,
      localPath: 'i18n/original', // custom your i18n folder path

      //Warning: the following parameter will not be use if you defined a logout url via
      //the HEADERS - X-LINSHARE-POST-LOGOUT-URL
      postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso'

      extLink: {
        enable: false,
        icons: '',
        href: 'http://your.link.local',
        name: {
          'fr-FR': 'test FR',
          'en-US': 'test EN',
          'vi-VN': 'test VI'
        }
      },
    });
})();
