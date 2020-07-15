(function() {
  'use strict';

  angular
    .module('linshare.changePassword', [
      'pascalprecht.translate',
      'linshare.components'
    ]);
})();

require('./route');
require('./controller/changePasswordController');
require('./services/changePasswordRestService');