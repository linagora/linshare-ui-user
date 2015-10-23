angular.module('linshareUiUserApp')
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
    RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers) {
      headers['WWW-No-Authenticate'] = 'linshare';
    });
    flowFactoryProvider.defaults = {
      simultaneousUploads: 1,
      //testChunks:false,
      target: 'linshare/flow.json',
      permanentErrors: [401, 500, 501]
    };
  })
  .config(function(localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('lsUser')
      .setNotify(true, true);
  })
  .run(function($rootScope, $location, Restangular, growl) {
    /**
     * Restangular Interceptor
     * Show message box when an error occured
     */
    Restangular.setErrorInterceptor(function(response) {
      if (response.status === 503) {
        growl.error('503 - Serveur Indisponible');
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
