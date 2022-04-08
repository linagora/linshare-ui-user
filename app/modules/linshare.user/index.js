angular
  .module('linshare.userProfile', [ 'pascalprecht.translate' ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('userProfile');
  }]);

require('./route');
require('./controllers/userProfileController');
require('./services/LinShareUserService');
require('./services/meRestService');
