/**
 * linshareUiUserApp Module
 * @namespace linshareUiUserApp
 */
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
