/**
 * linshareUiUserApp Module
 * @namespace linshareUiUserApp
 */
(function(angular) {
  'use strict';

  angular.module('linshareUiUserApp', [
    'LocalStorageModule',
    'flow',
    'http-auth-interceptor',
    'linshare.anonymousUrl',
    'linshare.audit',
    'linshare.authentication',
    'linshare.contactsLists',
    'linshare.directives',
    'linshare.document',
    'linshare.external',
    'linshare.guests',
    'linshare.quota',
    'linshare.receivedShare',
    'linshare.resetPassword',
    'linshare.share',
    'linshare.sharedSpace',
    'linshare.upload',
    'linshare.userProfile',
    'linshare.safeDetails',
    'linshare.changePassword',
    'linshare.secondFactorAuthentication',
    'linshare.uploadRequests',
    'linshare.token',
    'ng.deviceDetector',
    'ngAnimate',
    'ngCookies',
    'ngMaterial',
    'ngMessages',
    'ngPromiseExtras',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTable',
    'pascalprecht.translate',
    'restangular',
    'ui.bootstrap',
    'ui.router'
  ]);
})(angular);

require('./constants');
require('./default.config');
require('./errorCode');
require('./route');
require('./run');

require('./common/loginController');
require('./common/uiUserMainController');
require('./home/home');
require('./services/functionalityRestService');
require('./services/menuService');
require('./services/serverManagerService');
require('./services/translateLoadFailureHandlerService');
require('./services/welcomeMessageService');
require('./directives/checkTableHeight/check-table-height.directive');
require('./directives/checkTableHeight/checkTableHeightController');
require('./directives/checkTableHeight/checkTableHeightService');
require('./directives/lsLeftSidebarDirective/lsLeftSidebarDirective');
require('./directives/lsLeftSidebarDirective/lsLeftSidebarController');
require('./directives/newUploadBounce/newUploadBounceDirective');
require('./directives/sidebar/sidebar.directive');
require('./directives/sidebar-content/sidebar-content.directive');
require('./directives/uploadPopupFiles/uploadPopupFilesDirective');
