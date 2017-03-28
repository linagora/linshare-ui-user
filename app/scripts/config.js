/**
 * linshareUiUserApp Constant
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .constant('lsAppConfig', {
      // For application configuration
      accountType: {
        internal: 'INTERNAL',
        guest: 'GUEST'
      },
      asyncUploadDelay: 2000,
      baseRestUrl: 'linshare/webservice/rest/user/v2',
      date_en_format: 'MM/dd/yyyy',
      date_fr_format: 'dd/MM/yyyy',
      debug: true,
      devMode: true,
      lang: {
        fr: 'fr-FR',
        en: 'en-US',
        vi: 'vi-VN'
      },
      licence: true,
      localPath: 'i18n/original', //custom your i18n folder path
      postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso',
      production: false,
      roles: {
        admin: 'ADMIN',
        write: 'WRITE',
        readonly: 'READ'
      },
      simultaneous_upload: 1,

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
      addMember: 'add-member',
      contactslists: 'contactslists',
      contactslistsAddContacts: 'contactslists-add-contacts',
      contactslistsContact: 'contactslists-contact',
      details: 'details',
      guestCreate: 'guest-create',
      guestDetails: 'guest-details',
      moreOptions: 'more-options',
      share: 'share',
      shareDetails: 'share-details',
      workgroupDetailFile: 'workgroup-detail-file'
    });
})();
