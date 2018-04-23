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
      baseRestUrl: 'linshare/webservice/rest/user/v2',
      debug: false,
      localPath: 'i18n/original', //custom your i18n folder path
      //Warning: the following parameter will not be use if you defined a logout url via
      //the HEADERS - X-LINSHARE-POST-LOGOUT-URL
      postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso'

      // For application configuration
      accountType: {
        internal: 'INTERNAL',
        guest: 'GUEST',
        superadmin: 'SUPERADMIN',
        system: 'SYSTEM'
      },
      asyncUploadDelay: 2000,
      lang: {
        fr: 'fr-FR',
        en: 'en-US',
        vi: 'vi-VN'
      },
      enableSafeDetails: false,
      licence: true,
      loginWithMailOnly: true,
      production: true,
      rejectedChar: ['<', '>', ':', '"', '/', '\\', '|', '?', '*', ','],
      roles: {
        admin: 'ADMIN',
        write: 'WRITE',
        readonly: 'READ'
      },
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
      moreOptions: 'more-options',
      share: 'share',
      shareDetails: 'share-details',
      workgroupNode: 'workgroup-node',
      hideOnNonAdmin: false,
      hideOnReadOnly: false
    });
})();
