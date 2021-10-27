/* eslint-disable camelcase */
/**
 * linshareUiUserApp Constant
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .constant('lsAppConfig', {
      //Default values if not set in config.js
      baseProductUrl: 'http://linshare.org',
      baseRestUrl: 'linshare/webservice/rest/user/v4',
      // The debug mode, allow to get more information while doing any interraction in the APP.
      // It is recommended to set it to 'true' when having any trouble for reporting information
      // from the browser console to your software vendor
      debug: false,
      localPath: 'i18n/original', //custom your i18n folder path
      //Warning: the following parameter will not be use if you defined a logout url via
      //the HEADERS - X-LINSHARE-POST-LOGOUT-URL
      postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso'

      /** Define external URLs of changing/reseting password for1 internal user
       * - changePasswordUrl: shows to internal user when logged in
       * - resetPasswordUrl: shows to user in reset password form (forgotten password)
       */
      changePasswordUrl: null,
      resetPasswordUrl: null,

      // To override the application logo set the url of the image corresponding
      // to the sizes (small 155x29 and big 500x192)
      applicationLogo : {
        small : require('../images/common/linshare-logo-white.png').default,
        large : require('../images/ls-logo-big.png').default
      },
      communityWhiteLogo: require('../images/community-white.png').default,
      communityBlueLogo: require('../images/common/community.png').default,
      communitySlogan: 'Libre & Free',
      // To override the background image of the login screen set the url of the image
      loginBackground : require('../images/bg-linshare-desktop.png').default,

      // For application configuration
      accountType: {
        internal: 'INTERNAL',
        guest: 'GUEST',
        superadmin: 'SUPERADMIN',
        system: 'SYSTEM'
      },
      asyncUploadDelay: 2000,
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
      enableSafeDetails: false,
      licence: true,
      loginWithMailOnly: true,
      production: true,
      rejectedChar: ['<', '>', ':', '"', '/', '\\', '|', '?', '*', ','],
      flowFactoryProviderDefaults : {
        /* Do not update this value. It is not yet supported by the backend. */
        simultaneousUploads: 3,
        allowDuplicateUploads: true,
        maxChunkRetries: 3,
        testChunks: true,
        chunkRetryInterval: 1000,
        initFileFn: function(flowFile) {
          var MIN_CHUNK_SIZE= 2*1024*1024;
          var MAX_CHUNK_SIZE = 100*1024*1024;

          var fileSize = flowFile.size;

          /*
            We have discovered a bug in flow.js which prevents us from
            leveraging a chunkSize that is not an integer.
            For example 1.73*1024*1024 is not going to work.
            As a solution, we decided to leverage an integer number of Megabyte.
          */
          var proposedChunkSize = Math.ceil((fileSize * 0.02)/(1024*1024))*1024*1024;

          var actualChunkSize = Math.min(
            Math.max(
              proposedChunkSize,
              MIN_CHUNK_SIZE
            ),
            MAX_CHUNK_SIZE
          );

          flowFile.flowObj.opts.chunkSize = actualChunkSize;
          flowFile.dynamicChunkSize = actualChunkSize;
        }
      },
      locale: {
        fullDate: 'EEEE d MMMM y',
        longDate: 'd MMMM y',
        medium: 'd MMM y HH:mm:ss',
        mediumDate: 'd MMM y',
        mediumTime: 'HH:mm:ss',
        short: 'dd/MM/y HH:mm',
        shortDate: 'dd/MM/y',
        shortTime: 'HH:mm'
      },
      tableParams: {
        count: 25,
        sorting: {
          modificationDate: 'desc'
        }
      },
      extLink: {
        enable: false,
        newTab: false,
        icon: 'zmdi zmdi-home',
        href: '',
        name: {
          'fr-FR': 'Nom',
          'en-US': 'Name',
          'vi-VN': 'Tên',
          'ru-RU': 'Имя'
        }
      },

      oidcEnabled: false,
      oidcSetting: {
        authority: 'https://auth.linshare.local/',
        client_id: 'linshare',
        client_secret: 'linshare',
        redirect_uri: window.location.origin + '/#!/oidc',
        post_logout_redirect_uri: window.location.origin + '/#!/login',
        response_type: 'code',
        scope: 'openid email profile'
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
      /* Define the default role selected when adding a new member to a drive
       * Possible value:
       *  - DRIVE_ADMIN
       *  - DRIVE_WRITER
       *  - DRIVE_READER
       *
       * If any other unknown value to system is set, the default order will be set (same as the list above)
       */
      defaultDriveMemberRole: 'DRIVE_READER',

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
      hideHomeMenuLink: false,

      // For upload options management
      mySpacePage: 'myspace',
      workgroupPage: 'workgroup',

      // For pages's name
      guestsList: 'guests-list',
      workgroupList: 'group_list',

      // For contactslists actions management
      contactsListsMinePage: 'contactslists-mine',
      contactsListsOthersPage: 'contactslists-others',

      // For right sidebar
      activeShareDetails: 'active-share-details',
      contactslists: 'contactslists',
      contactslistsAddContacts: 'contactslists-add-contacts',
      contactslistsContact: 'contactslists-contact',
      details: 'details',
      guestCreate: 'guest-create',
      guestDetails: 'guest-details',
      share: 'share',
      shareDetails: 'share-details',
      forward: 'forward',
      workgroupNode: 'workgroup-node',
      uploadRequestGroupCreate: 'uploadrequestgroup-create',
      uploadRequestGroupDetails: 'uploadrequestgroup-details',
      uploadRequestGroupAddRecipients: 'uploadrequest-add-recipients',
      uploadRequestEntryDetails: 'uploadrequestentry-details',
      uploadRequestDetails: 'uploadrequest-details',
      tokenCreate: 'token-create',
      tokenDetails: 'token-details',
      hideOnNonAdmin: false,
      hideOnReadOnly: false,
      thumbnailEngineActivated: true,

      /*
        Define configuration for the OTP uri generator.
        - type, digits, algorithm, period: need to match with linshare-core configuration
        - issuer: will determine the name of OTP entry in authentication mobile app
      */
      otpConfig: {
        type: 'totp',
        digits: 6,
        issuer: 'LinShare',
        algorithm: 'SHA1',
        period: 30
      }
    });
})();
