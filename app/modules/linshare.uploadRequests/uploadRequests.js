angular
  .module('linshare.uploadRequests', [
    'pascalprecht.translate'
  ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('uploadRequests');
  }]);

require('./route');
require('./constants');
require('./components/uploadRequestStatus/uploadRequestStatusComponent');
require('./components/uploadRequestGroupForm/uploadRequestGroupForm');
require('./components/uploadRequestGroupForm/uploadRequestGroupFormController');
require('./controllers/uploadRequestEntriesController');
require('./controllers/uploadRequestsController');
require('./controllers/uploadRequestGroupsController');
require('./services/uploadRequestObjectCoreService');
require('./services/uploadRequestEntryRestService');
require('./services/uploadRequestRestService');
require('./services/uploadRequestGroupObjectService');
require('./services/uploadRequestUtilsService');
require('./services/uploadRequestGroupRestService');
require('./services/uploadRequestObjectService');