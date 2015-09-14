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
    'ngTouch',
    'ngTable',
    'restangular',
    'ui.router',
    'http-auth-interceptor',
    'ui.bootstrap',
    'flow',
    'pageslide-directive',
    'pascalprecht.translate',
    'angular-growl',
    'linshare.userProfile',
    'linshare.authentication',
    'linshare.document',
    'linshare.share',
    'materialAdmin'
  ]);
