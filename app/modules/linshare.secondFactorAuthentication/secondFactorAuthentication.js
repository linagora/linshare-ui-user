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

require('./images/app-store.svg');
require('./images/google-play.svg');
require('./images/freeotp.svg');