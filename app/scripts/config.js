'use strict';

angular.module('linshareUiUserApp')
.constant('lsAppConfig', {
    baseRestUrl: 'linshare/webservice/rest/user', // default: 'linshare/webservice/rest/user'
	  localPath: 'i18n/original', //custom your i18n folder path
    debug: true,
    date_fr_format: 'dd/MM/yyyy',
    date_en_format : 'MM/dd/yyyy',
    simultaneous_upload: 1,
    production: false
});
