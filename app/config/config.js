/**
 * lsUserConfig Constant
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .constant('lsUserConfig', {
      baseRestUrl: 'linshare/webservice/rest/user/v4',
      // The debug mode, allow to get more information while doing any interraction in the APP.
      // It is recommended to set it to 'true' when having any trouble for reporting information
      // from the browser console to your software vendor
      debug: false,
      localPath: 'i18n/original', // custom your i18n folder path
      production: false,
      /** Define external URLs of changing/reseting password for1 internal user
       * - changePasswordUrl: shows to internal user when logged in
       * - resetPasswordUrl: shows to user in reset password form (forgotten password)
       */
      changePasswordUrl: null,
      resetPasswordUrl: null,

      // To override the application logo set the url of the image corresponding
      // to the sizes (small 155x29 and big 500x192)
      applicationLogo : {
        small: 'app/images/common/linshare-logo-white.png',
        large : 'app/images/ls-logo-big.png'
      },

      // To override the background image of the login screen set the url of the image
      loginBackground : 'app/images/bg-linshare-desktop.png',

      // Manage language handle by the application, see documentation.
      languages: {
        fr: {
          key: 'fr',
          fullKey: 'fr-FR',
          country: 'Français',
        },
        en: {
          key: 'us',
          fullKey: 'en-US',
          country: 'English'
        },
        vi: {
          key: 'vn',
          fullKey: 'vi-VN',
          country: 'Tiếng Việt'
        },
        ru: {
          key: 'ru',
          fullKey: 'ru-RU',
          country: 'Pусский'
        }
      },
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

      /* Define the default role selected when adding a new member to a workgroup
       * Possible value:
       *  - ADMIN
       *  - CONTRIBUTOR
       *  - WRITER
       *  - READER
       *
       * If any other unknown value to system is set, the default order will be set (same as the list above)
       */
      defaultWorkgroupMemberRole: 'READER',

      /* Define custom behavior for menu element in the main sidebar
       * suffix - object: Determine the suffix to add to menu element name if it is disabled
       *                   The value should be translated accordingly to the different language used by the application
       * disable - object: Determine for each menu element if their behavior should change from hidden to disabled
       */
      menuLinks: {
        suffix:{
          'fr-FR': '',
          'en-US': '',
          'vi-VN': ''
        },
        disable: {
          'MENU_TITLE.CONTACTS_LISTS': false,
          'MENU_TITLE.GUESTS': false,
          'MENU_TITLE.FILES': false,
          'MENU_TITLE.RECEIVED_SHARES': false,
          'MENU_TITLE.UPLOAD_AND_SHARE': false,
          'MENU_TITLE.SHARED_SPACE': false
        }
      },

      /* Define the Application home page, can be undefined for default behavior or one of the following:
       * documents.files
       * documents.received
       * documents.upload
       * sharedspace.all
       * administration.contactslists.list
       * administration.guests
       * audit.global
       */
      homePage: 'home',
      /* Determine show/hide of home link in sidebar menu */
      hideHomeMenuLink: false
    });
})();
