angular
  .module('linshare.secondFactorAuthentication', [
    'pascalprecht.translate',
    'linshare.components',
    'linshare.directives',
    'linshare.utils',
    'ngclipboard'
  ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('secondFactorAuthentication');
  }]);

require('./constants');
require('./route');
require('./services/secondFactorAuthenticationRestService');
require('./services/secondFactorAuthenticationTransitionService');
require('./components/freeOtpSetupHint/freeOtpSetupHint');
require('./components/sharedKeyCreation/sharedKeyCreation');
require('./components/sharedKeyCreation/sharedKeyCreationController');
require('./components/sharedKeyRemoval/sharedKeyRemoval');
require('./components/sharedKeyRemoval/sharedKeyRemovalController');
require('./controllers/secondFactorAuthenticationController');
require('./controllers/secondFactorAuthenticationLoginController');
