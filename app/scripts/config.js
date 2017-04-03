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
      debug: true,
      devMode: true,
      localPath: 'i18n/original', //custom your i18n folder path
      postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso',
    });
})();
