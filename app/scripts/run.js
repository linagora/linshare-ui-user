/* global uuid:false */
'use strict';

angular
  .module('linshareUiUserApp')
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false */
  .config(function(_, RestangularProvider, flowFactoryProvider, $compileProvider, $translateProvider,
                   $translatePartialLoaderProvider, lsAppConfig, lsUserConfig, $windowProvider,
                   uibDatepickerPopupConfig) {
    uibDatepickerPopupConfig.showButtonBar = false;
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
      target: $windowProvider.$get().location.origin + '/' + lsAppConfig.baseRestUrl + '/flow.json',
      generateUniqueIdentifier: function() {
        return uuid.v4();
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

    _.forEach(
      lsAppConfig.flowFactoryProviderDefaults,
      function(value, key) {
        flowFactoryProvider.defaults[key] = value;
      }
    );
    /* Do not update this value. It is not yet supported by the backend. */
    flowFactoryProvider.defaults['simultaneousUploads'] = 1;

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

  .config(function(localStorageServiceProvider, $logProvider, $windowProvider, lsAppConfig, _) {
    localStorageServiceProvider
      .setPrefix('lsUser')
      .setNotify(true, true);

    var $window = $windowProvider.$get();
    var isActivatedDebugModeFromLocalStorage = $window.localStorage.getItem('lsUser.debugMode');
    var isDebugModeActivated = !_.isNil(isActivatedDebugModeFromLocalStorage) ?
        isActivatedDebugModeFromLocalStorage :
        lsAppConfig.debug;

    $logProvider.debugEnabled(isDebugModeActivated );
  })

  .run(function($rootScope, $filter, $location, $state, Restangular, $log, $window, localStorageService,
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
              $log.info('Server is under maintenance.');
              $window.location.href = '/';
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
            toastService.error({key: 'TOAST_ALERT.ERROR.NO_RESPONSE_ERROR'});
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

    $rootScope.$on('$translatePartialLoaderStructureChanged', function() {
      languageService.refreshLocale();
    });

    $state.defaultErrorHandler(function(error) {
      if (error.detail) {
        var message = error.detail.statusText || error.detail.message || error.message;
        $log.error('$transitions.onError - ', message);
      } else {
        $log.error('$transitions.onError - ', error);
      }
    });

  })

  .run(function($rootScope, Restangular, lsAppConfig, $window) {
    var protocol = $window.location.protocol;
    var host = $window.location.host.replace(/\/$/, '');
    var fqdn = protocol + '//' + host;
    lsAppConfig.backendUrl = [fqdn, validate(lsAppConfig.baseRestUrl)].join('/');
    Restangular.setBaseUrl(lsAppConfig.backendUrl);
    $rootScope.linshareModeProduction = lsAppConfig.production;
    $rootScope.linshareLicence = lsAppConfig.licence;
  })

  .run(['$templateCache', '$http', function($templateCache, $http) {
    $http.get('modules/linshare.components/working-date-picker/views/day.html').then(function(response) {
      $templateCache.put('uib/template/datepicker/day.html', response.data);
    });
    $http.get('modules/linshare.components/working-date-picker/views/month.html').then(function(response) {
      $templateCache.put('uib/template/datepicker/month.html', response.data);
    });
    $http.get('modules/linshare.components/working-date-picker/views/year.html').then(function(response) {
      $templateCache.put('uib/template/datepicker/year.html', response.data);
    });
    $http.get('modules/linshare.components/working-date-picker/views/popup.html').then(function(response) {
      $templateCache.put('uib/template/datepicker/popup.html', response.data);
    });

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
