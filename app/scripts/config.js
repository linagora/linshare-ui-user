'use strict';

angular.module('linshareUiUserApp')
  .factory('MyErrorHandler', function ($q, $log, $http, lsAppConfig) {
    return function (part, lang) {
      $log.error('The "' + lsAppConfig.localPath + lang + '/' + part +'.json' + '" part was not loaded.');
      var path = 'i18n/original/' + lang + '/' + part +'.json';
      var content = null;
      return $q.when(
        $http.get(path).then(function(data) {
          return data.data;
        })
      );
    };
  })
  .config(function(RestangularProvider, flowFactoryProvider, $compileProvider, $translateProvider, $translatePartialLoaderProvider, lsAppConfig) {
    var pathToLocal = (lsAppConfig.localPath) ? lsAppConfig.localPath : 'i18n/original/';
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: pathToLocal + '{lang}/{part}.json',
      loadFailureHandler: 'MyErrorHandler'
    });
    $translatePartialLoaderProvider.addPart('general');
    $translateProvider.preferredLanguage('fr');
    RestangularProvider.setBaseUrl(lsAppConfig.baseEndpoint);
    RestangularProvider.setDefaultHttpFields({cache: false});
    RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json;'});
    RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers) {
      headers['WWW-No-Authenticate'] = 'linshare';
    });
    flowFactoryProvider.defaults = {
      simultaneousUploads: 1,
      //testChunks:false,
      target: lsAppConfig.baseEndpoint + '/flow.json',
      permanentErrors: [401, 500, 501]
    };
    /*
    ** aHrefSanitizationWhitelist :
    ** The sanitization is a security measure aimed at preventing XSS attacks via html links.
    ** Any url about to be assigned to a[href] via data-binding is first normalized and turned into an absolute url.
    ** If a match is found, the original url is written into the dom.
    ** Otherwise, the absolute url is prefixed with 'unsafe:' string and only then is it written into the DOM.
    ** More info : https://docs.angularjs.org/api/ng/provider/$compileProvider
    */
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
  })
  .config(function(localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('lsUser')
      .setNotify(true, true);
  })
  .run(function($rootScope, $location, $translate, Restangular, growlService) {
    /**
     * Restangular Interceptor
     * Show message box when an error occured
     */
    Restangular.setErrorInterceptor(function(response) {
      if (response.status === 503) {
        growlService.growl('503 - Serveur Indisponible');
      }
      return true;
    });
    Restangular.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      console.log('my addresponseintercep', response);
      if (response.status === 401)  $rootScope.$emit('lsIntercept401', 'yoyo');
      return data;
    });
    $rootScope.$on('lsIntercept401', function(event, data) {
      console.log('data from lsIntercept401', data);
    });
    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
      console.log('routechangestart', toState, 'my event', evt, 'toParams', toParams, 'fromState', fromState);
      //if (AuthenticationService.getCurrentUser()) {
      //  console.log('logged boss', AuthenticationService.getCurrentUser());
      //}
      if (toState.templateUrl === 'views/common/loginForm.html') {
        console.log('in there');
        $rootScope.$on('event:auth-loginConfirmed', function() {
          console.log('in event');
          $location.path('/home');
        });
      }
    });
    //$rootScope.$on('event:auth-loginRequired', function(){
    //  console.log('login required, next is', '');
    //// $location.path('/login');
    //});
    $rootScope.$on('event:auth-loginRequired', function(){
      console.log('login required, next is', '');
    // $location.path('/login');
    });
    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
      $translate.refresh();
    });
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
  })
  .run(function ($rootScope, $state, $stateParams, LinshareUserService) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    console.log('my LinshareUserService', LinshareUserService);
  })

  .run(['$templateCache', '$http', function($templateCache, $http) {
    $http.get('views/includes/templates.html', {cache: $templateCache});
  }])

  .run(['$templateCache', function($templateCache) {

    $templateCache.get('views/includes/chat.html');

    $templateCache.get('views/includes/footer.html');

    $templateCache.get('views/includes/header.html');

    $templateCache.get('views/includes/profile-menu.html');

    $templateCache.get('views/includes/sidebar-left.html');

    $templateCache.put('views/includes/templates.html', "");

  }]);
