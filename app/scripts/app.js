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
    'linshare.share'
  ])
  .config(function(RestangularProvider, flowFactoryProvider, $translateProvider) {
    $translateProvider.translations('en', {
      HEADLINE: 'Hello there, This is my awesome app!',
      INTRO_TEXT: 'And it has i18n support!'
    })
      .translations('de', {
        HEADLINE: 'Hey, das ist meine großartige App!',
        INTRO_TEXT: 'Und sie untersützt mehrere Sprachen!'
      });
    $translateProvider.preferredLanguage('en');
    RestangularProvider.setBaseUrl('linshare');
    RestangularProvider.setDefaultHttpFields({cache: false});
    RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json;'});
    RestangularProvider.addFullRequestInterceptor(function (element, operation, route, url, headers) {
      headers['WWW-No-Authenticate'] = 'linshare';
    });
    flowFactoryProvider.defaults = {
      simultaneousUploads: 1,
      //testChunks:false,
      target: 'linshare/flow.json',
      permanentErrors:[401, 500, 501]
    };
  })
  .run(function($rootScope, $location, AuthenticationService, Restangular, growl) {
    /**
     * Restangular Interceptor
     * Show message box when an error occured
     */
    Restangular.setErrorInterceptor(function(response) {
      if(response.status === 503) {
        growl.error('503 - Serveur Indisponible');
      }
      return true;
    });
    $rootScope.$on('$routeChangeStart', function(evt, next) {
      console.log('routechangestart',next);
      if (AuthenticationService.getCurrentUser()) {
        console.log('logged boss', AuthenticationService.getCurrentUser());
      }
      if(next.templateUrl === 'views/common/loginForm.html'){
        console.log('in there');
        $rootScope.$on('event:auth-loginConfirmed', function(){
          console.log('in event');
          $location.path('/home');
        });
      }
    });
      //$rootScope.$on('event:auth-loginRequired', function(){
      //  console.log('login required, next is', nexturl);
      //  $location.path('/login');
      //});
    //  $rootScope.$on('event:auth-loginConfirmed', function(){
    //    console.log('NEXTMQSDJ',nexturl, evt);
    //    $location.path('/' + nexturl.templateUrl);
    //  });
      //console.log(AuthenticationService.getCurrentUser());
      //if(!AuthenticationService.getCurrentUser()){
      //  if(next.templateUrl === 'login.html') {
	  //
      //  } else {
      //    $location.path('/login');
      //  }
      //}
    //});
    //$rootScope.$on('event:auth-loginRequired', function(){
    //  $location.path('/login');
    //  console.log('scope $on', '$location.path()');
    //});
    //$rootScope.$on('event:auth-loginConfirmed', function(evt, next, current){
    //  console.log('rootscope $on', 'auth confirmed');
    //  $location.path('/'+ next.templateUrl);
    //});
  });
