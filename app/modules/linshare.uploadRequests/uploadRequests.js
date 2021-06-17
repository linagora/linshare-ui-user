angular
  .module('linshare.uploadRequests', [ 'pascalprecht.translate' ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('uploadRequests');
  }])
  .run(extendUploadRequestEntryModel);;

extendUploadRequestEntryModel.$inject = ['documentModelRestService'];

function extendUploadRequestEntryModel(documentModelRestService) {
  documentModelRestService.launchExtendModel('entries', {
    useCustomRoute: item => `upload_request_entries/${item.uuid}`
  });
}

require('./route');
require('./constants');
require('./components/uploadRequestStatus/uploadRequestStatusComponent');
require('./components/uploadRequestGroupForm/uploadRequestGroupForm');
require('./components/uploadRequestGroupForm/uploadRequestGroupFormController');
require('./components/uploadRequestForm/uploadRequestForm');
require('./components/uploadRequestForm/uploadRequestFormController');
require('./controllers/uploadRequestEntriesController');
require('./controllers/uploadRequestsController');
require('./controllers/uploadRequestGroupsController');
require('./controllers/archiveUploadRequestDialogController');
require('./services/uploadRequestObjectCoreService');
require('./services/uploadRequestEntryRestService');
require('./services/uploadRequestRestService');
require('./services/uploadRequestGroupObjectService');
require('./services/uploadRequestUtilsService');
require('./services/uploadRequestGroupRestService');
require('./services/uploadRequestObjectService');