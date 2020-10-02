angular
  .module('linshare.uploadRequests', [
    'pascalprecht.translate'
  ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('uploadRequests');
  }]);

require('./route');
require('./constants');
require('./controllers/uploadRequestGroupsController');
require('./controllers/uploadRequestController');
require('./services/uploadRequestRestService');
require('./services/uploadRequestObjectService');
require('./services/uploadRequestUtilsService');
require('./services/uploadRequestGroupRestService');
