/**
 * @author Alpha O. Sall <asall@linagora.com>
 */

'use strict';

var anonymousUrl = angular.module('linshare.anonymousUrl', ['ngResource', 'ngRoute', 'ui.router', 'ui.bootstrap']);

var config = function($stateProvider) {

  $stateProvider

    .state('anonymousUrl', {
      templateUrl: 'modules/linshare.anonymousUrl/views/common.html'
    })

    .state('anonymousUrl.home', {
      url: '/external/anonymous_url/home',
      templateUrl: 'modules/linshare.anonymousUrl/views/home.html'
    })

    .state('anonymousUrl.list', {
      url: '/external/anonymous/:uuid',
      controller: 'AnonymousUrlController as urlCtrl',
      resolve: {
        anonymousUrlUuid: function($stateParams) {
          return $stateParams.uuid;
        }
      },
      template: '<ls-anonymous-url-template></ls-anonymous-url-template>'
    });
};

var constants = {
  baseRestUrl: 'linshare/webservice/rest/anonymousurl'
};

anonymousUrl.config(config);
anonymousUrl.constant('lsAnonymousUrlConfig', constants);
