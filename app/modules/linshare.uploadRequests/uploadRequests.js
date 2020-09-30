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
require('./services/uploadRequestObjectService');
require('./services/uploadRequestUtilsService');
require('./services/uploadRequestGroupRestService');
