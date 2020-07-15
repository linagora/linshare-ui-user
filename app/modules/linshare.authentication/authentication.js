/**
 * @ngdoc overview
 * @name linshare.Authentication
 */
angular
  .module('linshare.authentication', ['restangular', 'http-auth-interceptor'])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl('linshare');
    RestangularProvider.setDefaultHttpFields({cache: false});
    RestangularProvider.setDefaultHeaders({'Content-Type': 'application/json;'});
    RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers) {
      headers['WWW-No-Authenticate'] = 'linshare';
    });
  });

require('./constants');
require('./controllers/authenticationController');
require('./services/authenticationRestService');
require('./services/authenticationUtilsService');