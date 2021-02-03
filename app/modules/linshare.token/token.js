angular
  .module('linshare.token', [
    'pascalprecht.translate'
  ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('tokenManagement');
  }]);

require('./route');
require('./controllers/tokenManagementController');
require('./services/jwtRestService');