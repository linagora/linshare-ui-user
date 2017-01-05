'use strict';

angular
  .module('linshareUiUserApp')
  .factory('MyErrorHandler', function($q, $log, $http, lsAppConfig) {
    return function(part, lang) {
      $log.error('The "' + lsAppConfig.localPath + '/' + lang + '/' + part + '.json' + '" part was not loaded.');
      var path = 'i18n/original/' + lang + '/' + part + '.json';
      return $q.when(
        $http.get(path).then(function(data) {
          return data.data;
        })
      );
    };
  })
  .config(function(RestangularProvider, flowFactoryProvider, $compileProvider, $translateProvider,
                   $translatePartialLoaderProvider, lsAppConfig, $windowProvider) {
    var pathToLocal = (lsAppConfig.localPath) ? lsAppConfig.localPath : 'i18n/original/';
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: pathToLocal + '/{lang}/{part}.json',
      loadFailureHandler: 'MyErrorHandler'
    });
    $translateProvider.fallbackLanguage('en-US');
    $translatePartialLoaderProvider.addPart('general');
    $translatePartialLoaderProvider.addPart('notification');
    $translateProvider.preferredLanguage('en-US');
    RestangularProvider.setDefaultHttpFields({
      cache: false
    });
    RestangularProvider.setDefaultHeaders({
      'Content-Type': 'application/json;'
    });
    RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers) {
      headers['WWW-No-Authenticate'] = 'linshare';
      if (angular.isObject(element)) {
        delete element.isSelected;
        delete element.typeImage;
        delete element.info;
      }
      return element;
    });
    flowFactoryProvider.defaults = {
      simultaneousUploads: lsAppConfig.simultaneous_upload,
      //testChunks:false,
      target: $windowProvider.$get().location.origin + '/' + lsAppConfig.baseRestUrl + '/flow.json',
      allowDuplicateUploads: true,
      generateUniqueIdentifier: function() {
        /* jshint ignore:start */
        return uuid.v4();
        /* jshint ignore:end */
      },
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

.config(function(localStorageServiceProvider, $logProvider, lsAppConfig) {
  $logProvider.debugEnabled(lsAppConfig.debug);
  localStorageServiceProvider
    .setPrefix('lsUser')
    .setNotify(true, true);
})

.run(function($rootScope, $filter, $location, Restangular, growlService, $log, $window, localStorageService,
              languageService) {
  $rootScope.browserLanguage = $window.navigator.language || $window.navigator.userLanguage;
  var storedLocale = localStorageService.get('locale');
  if (storedLocale) {
    languageService.changeLocale(storedLocale);
  } else {
    languageService.changeLocale($rootScope.browserLanguage);
  }

  /**
   * Restangular Interceptor
   * Show message box when an error occured
   */
  Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
    switch (response.status) {
      case 400:
        if (response.data.errCode !== 26006) {
          growlService.notifyTopCenter('GROWL_ALERT.ERROR.400', 'danger');
        }
        $log.debug('Error ' + response.status, response);
        break;
      case 404:
        $log.debug('Resource not found', response);
        break;
      case 500:
        growlService.notifyTopCenter('GROWL_ALERT.ERROR.500', 'danger');
        $log.debug('Error ' + response.status, response);
        break;
      case 503:
        growlService.notifyTopCenter('GROWL_ALERT.ERROR.503', 'danger');
        break;
      default:
        if (response.status) {
          growlService.notifyTopCenter('GROWL_ALERT.ERROR.' + response.status, 'danger');
          $log.debug('Error ' + response.status, response);
        } else {
          var $translate = $filter('translate');
          growlService.notifyTopCenter('GROWL_ALERT.ERROR.' + $translate('NO_RESPONSE_ERROR'), 'danger');
          $log.debug('deferred', deferred);
          $log.debug('response', response);
          $log.debug('responseHandler', responseHandler);
          deferred.resolve(false);
          return false;
        }
    }
    return true;
  });

  /*jshint unused: false */
  Restangular.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
    $log.debug('addResponseInterceptor => response', response);
    if (response.status === 401) {
      $rootScope.$emit('lsIntercept401');
    }
    return data;
  });

  $rootScope.$on('lsIntercept401', function(event, data) {
    $log.debug('data from lsIntercept401', data);
  });

  $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
    $rootScope.toState = toState.name;
    $rootScope.toParams = toParams;
    $rootScope.fromState = fromState.name;
    $rootScope.fromParams = fromParams;
  });

  $rootScope.$on('$translatePartialLoaderStructureChanged', function() {
    languageService.refreshLocale();
  });
})

.run(function($rootScope, $state, $stateParams, Restangular, lsAppConfig, $window) {
  var protocol = $window.location.protocol;
  var host = $window.location.host.replace(/\/$/, '');
  var fqdn = protocol + '//' + host;
  lsAppConfig.backendUrl = [fqdn, validate(lsAppConfig.baseRestUrl)].join('/');
  Restangular.setBaseUrl(lsAppConfig.backendUrl);
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.linshareBaseUrl = [fqdn, validate(lsAppConfig.baseRestUrl)].join('/');
  $rootScope.devMode = lsAppConfig.devMode;
  $rootScope.linshareModeProduction = lsAppConfig.production;
})

.run(['$templateCache', '$http', function($templateCache, $http) {
  $http.get('views/includes/templates.html', {
    cache: $templateCache
  });
}])

.run(['$templateCache', function($templateCache) {

  $templateCache.get('views/includes/sidebar-right.html');

  $templateCache.get('views/includes/footer.html');

  $templateCache.get('views/includes/header.html');

  $templateCache.get('views/includes/profile-menu.html');

  $templateCache.get('views/includes/sidebar-left.html');

  $templateCache.put('views/includes/templates.html', '');

}]);

/*jshint latedef:false */
function validate(str) {
  str = str.trim();
  str = str.replace(/^\/|\/$/g, ''); //remove first and last slash if present
  return str;
}
