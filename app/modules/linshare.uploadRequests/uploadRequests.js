angular
  .module('linshare.uploadRequests', [
    'pascalprecht.translate'
  ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('uploadRequests');
  }]);

require('./route');
require('./controllers/LinshareUploadRequestsController');
