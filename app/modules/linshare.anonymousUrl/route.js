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
  function anonymousUrlConfig(_, $stateProvider) {
    $stateProvider
      .state('anonymousUrl', {
        template: require('../../modules/linshare.anonymousUrl/views/common.html')
      })
      .state('anonymousUrl.home', {
        url: '/external/anonymous/',
        params: {
          error: undefined
        },
        resolve: {
          message: function($state, $transition$) {
            var message = 'ANONYMOUS_URL.HOME.';
            var params = $transition$.params();

            return _.isUndefined(params.error) ? message + 'MESSAGE' : message + params.error.status;
          }
        },
        controller: 'AnonymousHomeController',
        controllerAs: 'anonymousHomeVm',
        template: require('../../modules/linshare.anonymousUrl/views/home.html')
      })
      .state('anonymousUrl.list', {
        url: '/external/anonymous/:uuid',
        controller: 'AnonymousUrlController',
        controllerAs: 'anonymousUrlVm',
        resolve: {
          anonymousUrlData: function($state, $transition$, anonymousUrlService) {
            return anonymousUrlService.getAnonymousUrl($transition$.params().uuid)
              .then(data => {
                const urlData = data.data;

                if (_.isUndefined(urlData.uuid)) {
                  urlData.protectedByPassword = true;
                  urlData.uuid = $transition$.params().uuid;
                } else {
                  urlData.protectedByPassword = false;
                }

                return urlData;
              }).catch(error => {
                $transition$.abort();
                $state.go('anonymousUrl.home', { error });
              });
          }
        },
        template: '<ls-anonymous-url-template></ls-anonymous-url-template>'
      });
  }
})();
