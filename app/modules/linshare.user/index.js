angular
  .module('linshare.userProfile', [ 'pascalprecht.translate' ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('userProfile');
  }]);

require('./route');
require('./controllers/userProfileController');
require('./services/LinShareUserService');
require('./services/meRestService');
require('./components/userRecipientsList/userRecipientsListController');
require('./components/userRecipientsList/userRecipientsList');
