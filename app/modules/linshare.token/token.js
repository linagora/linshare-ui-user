angular
  .module('linshare.token', [
    'pascalprecht.translate'
  ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('tokenManagement');
  }]);

require('./route');
require('./controllers/tokenManagementController');
require('./components/tokenManagementFormController');
require('./controllers/createdTokenDialogController');
require('./components/tokenManagementForm');
require('./services/jwtRestService');
require('./services/tokenManagementUtilsService');
require('./images/token-dialog-icon.svg');