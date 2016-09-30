'use strict';

angular.module('linshareUiUserApp')
.constant('lsAppConfig', {
    baseRestUrl: 'linshare/webservice/rest/user/v2', // default: 'linshare/webservice/rest/user/v2'
	localPath: 'i18n/original', //custom your i18n folder path
    postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso',
    debug: true,
    date_fr_format: 'dd/MM/yyyy',
    date_en_format : 'MM/dd/yyyy',
    simultaneous_upload: 1,
    devMode: true,
    production: false
});
