'use strict';

angular.module('linshareUiUserApp')
.constant('lsAppConfig', {
    baseRestUrl: 'linshare/webservice/rest/user', // default: 'linshare/webservice/rest/user'
	  localPath: 'i18n/original', //custom your i18n folder path
    debug: true,
    production: false
});
