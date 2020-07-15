angular.module(
  'linshare.guests',
  [
    'restangular',
    'linshare.utils',
    'pascalprecht.translate',
  ]
);

require('./constants');
require('./controllers/LinshareGuestsController');
require('./directives/guest-form/guest-form.directive');
require('./services/guestObjectService');
require('./services/guestsRestService');