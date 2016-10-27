(function() {
	'use strict';

	/**
	 * @ngdoc overview
	 * @name linshare.Authentication
	 */
	/*jshint sub:true*/
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
})();
