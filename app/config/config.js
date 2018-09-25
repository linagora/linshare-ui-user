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

      // To override the application logo set the url of the image corresponding to the sizes (small 155x29 and big 500x192)
      applicationLogo : {
        small : 'images/common/linshare-logo-white.png',
        large : 'images/ls-logo-big.png'
      },

      // To override the background image of the login screen set the url of the image
      loginBackground : 'images/bg-linshare-desktop.png',


      //Warning: the following parameter will not be use if you defined a logout url via
      //the HEADERS - X-LINSHARE-POST-LOGOUT-URL
      postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso'

      extLink: {
        enable: false,
        newTab: true,
        icon: 'zmdi zmdi-home',
        href: 'http://your.link.local',
        name: {
          'fr-FR': 'Nom',
          'en-US': 'Name',
          'vi-VN': 'Tên'
        }
      },
    });
})();
