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
require('./components/guestForm/guestForm');
require('./components/guestForm/guestFormController');
require('./services/guestObjectService');
require('./services/guestsRestService');