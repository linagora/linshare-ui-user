'use strict';

/**
 * @ngdoc overview
 * @name linshareUiUserApp
 * @description
 *
 * This is the main module of the application
 * The app is in construction
 *
 **/
angular
  .module('linshareUiUserApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTable',
    'restangular',
    'ui.router',
    'http-auth-interceptor',
    'ui.bootstrap',
    'flow',
    'angular-growl',
    'linshare.upload',
    'linshare.userProfile',
    'linshare.authentication',
    'linshare.contactsLists',
    'linshare.document',
    'linshare.share',
    'linshare.sharedSpace',
    'linshare.guests',
    'linshare.receivedShare',
    'LocalStorageModule',
    'pascalprecht.translate',
    'materialAdmin',
    'ngMaterial',
    'ui.bootstrap.contextMenu',
    'localytics.directives',
    'linshare.anonymousUrl'
  ]);
