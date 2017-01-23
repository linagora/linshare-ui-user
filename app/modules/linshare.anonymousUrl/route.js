/**
 * anonymousUrlConfig Config
 * @namespace LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .config(anonymousUrlConfig);

  /**
   *  @namespace anonymousUrlConfig
   *  @desc Config of module Anonymous
   *  @memberOf LinShare.anonymousUrl
   */
  function anonymousUrlConfig($stateProvider) {
    $stateProvider
      .state('anonymousUrl', {
        templateUrl: 'modules/linshare.anonymousUrl/views/common.html'
      })
      .state('anonymousUrl.home', {
        url: '/external/anonymous/',
        params: {
          error: undefined
        },
        resolve: {
          message: function($state, $stateParams) {
            var message = 'ANONYMOUS_URL.HOME.';
            return _.isUndefined($stateParams.error) ? message + 'MESSAGE' : message + $stateParams.error.status;
          }
        },
        controller: 'AnonymousHomeController',
        controllerAs: 'anonymousHomeVm',
        templateUrl: 'modules/linshare.anonymousUrl/views/home.html'
      })
      .state('anonymousUrl.list', {
        url: '/external/anonymous/:uuid',
        controller: 'AnonymousUrlController',
        controllerAs: 'anonymousUrlVm',
        resolve: {
          anonymousUrlData: function($q, $state, $stateParams, anonymousUrlService) {
            var deferred = $q.defer();
            anonymousUrlService.getAnonymousUrl($stateParams.uuid).then(function(data) {
              var urlData = data.data;
              if ( _.isUndefined(urlData.uuid)) {
                urlData.protectedByPassword = true;
                urlData.uuid = $stateParams.uuid;
              } else {
                urlData.protectedByPassword = false;
              }
              deferred.resolve(urlData);
            }).catch(function(error) {
              $state.go('anonymousUrl.home', {
                'error': error
              });
              deferred.reject(error);
            });
            return deferred.promise;
          },
        },
        template: '<ls-anonymous-url-template></ls-anonymous-url-template>'
      });
  }
})();
