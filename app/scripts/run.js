'use strict';

angular
  .module('linshareUiUserApp')
  .config(['$provide', function ($provide) {
    $provide.decorator('$q', ['$delegate', function ($delegate) {
      var $q = $delegate;

      $q.allSettled = $q.allSettled || function allSettled(promises) {
        // Implementation of allSettled function from Kris Kowal's Q:
        // https://github.com/kriskowal/q/wiki/API-Reference#promiseallsettled

        var wrapped = angular.isArray(promises) ? [] : {};

        angular.forEach(promises, function(promise, key) {
          if (!wrapped.hasOwnProperty(key)) {
            wrapped[key] = wrap(promise);
          }
        });

        return $q.all(wrapped);

        function wrap(promise) {
          return $q.when(promise)
            .then(function (value) {
              return {state: 'fulfilled', value: value};
            }, function (reason) {
              return {state: 'rejected', reason: reason};
            });
        }
      };

      return $q;
    }]);
  }])
  .config(function(_, RestangularProvider, flowFactoryProvider, $compileProvider, $translateProvider,
                   $translatePartialLoaderProvider, lsAppConfig, lsUserConfig, $windowProvider) {
    lsAppConfig = _.assign(lsAppConfig, lsUserConfig);
    var pathToLocal = (lsAppConfig.localPath) ? lsAppConfig.localPath : 'i18n/original/';
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: pathToLocal + '/{lang}/{part}.json',
      loadFailureHandler: 'translateLoadFailureHandlerService'
    });
    $translateProvider.fallbackLanguage('en-US');
    $translatePartialLoaderProvider.addPart('general');
    $translatePartialLoaderProvider.addPart('notification');
    $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
    $translateProvider.preferredLanguage('en-US');
    RestangularProvider.setDefaultHttpFields({
      cache: false
    });
    RestangularProvider.setDefaultHeaders({
      'Content-Type': 'application/json;'
    });
    RestangularProvider.setRestangularFields({
        id: 'uuid'
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
      stack: [],
      simultaneousUploads: lsAppConfig.simultaneousUpload,
      //testChunks:false,
      target: $windowProvider.$get().location.origin + '/' + lsAppConfig.baseRestUrl + '/flow.json',
      allowDuplicateUploads: true,
      generateUniqueIdentifier: function() {
        /* jshint ignore:start */
        return uuid.v4();
        /* jshint ignore:end */
      },
      query: function(flowFile) {
        var workgroupUuidParam = '';
        var parentUuidParam = '';
        if(!_.isUndefined(flowFile.folderDetails)) {
          if(!_.isNil(flowFile.folderDetails.workgroupUuid)) {
            workgroupUuidParam = flowFile.folderDetails.workgroupUuid;
            parentUuidParam = !_.isNil(flowFile.folderDetails.folderUuid) ? flowFile.folderDetails.folderUuid : '';
          }
        }
        var flowParams = {
          asyncTask: true,
          workGroupUuid: workgroupUuidParam,
          workGroupParentNodeUuid: parentUuidParam
        };
        return flowParams;
      },
      headers: {'WWW-No-Authenticate' : 'linshare'}
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

  .run(function($rootScope, $filter, $location, Restangular, $log, $window, localStorageService,
                languageService, toastService) {
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
      switch(response.status) {
        case 400:
          $log.debug('Error ' + response.status, response);
          break;
        case 404:
          $log.debug('Resource not found', response);
          if (response.data) {
            if (response.data.errCode === 666) {
              $log.info("Server is under maintenance.");
              $window.location.href = "/";
            }
          }
          break;
        case 500:
          $log.debug('Error ' + response.status, response);
          break;
        case 503:
          $log.debug('Error ' + response.status, response);
          break;
        default:
          if (response.status) {
            $log.debug('Error ' + response.status, response);
          } else {
            toastService.error({key: 'GROWL_ALERT.ERROR.NO_RESPONSE_ERROR'});
            $log.debug('deferred', deferred);
            $log.debug('response', response);
            $log.debug('responseHandler', responseHandler);
            deferred.resolve(false);
            return false;
          }
      }
      return true;
    });

    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
      $rootScope.toState = toState.name;
      $rootScope.toParams = toParams;
      $rootScope.fromState = fromState.name;
      $rootScope.fromParams = fromParams;
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

    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState) {
      $rootScope.toState = toState.name;
      $rootScope.fromState = fromState.name;
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
    $rootScope.linshareModeProduction = lsAppConfig.production;
    $rootScope.linshareLicence= lsAppConfig.licence;
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
