(function() {
  'use strict';

  angular
    .module('linshare.resetPassword', [
      'pascalprecht.translate',
    ]);
})();

require('./constants');
require('./route');
require('./controllers/resetPasswordController');
require('./directives/reset-form/reset-form.directive');
require('./directives/reset-form/resetFormController');
require('./services/resetPasswordService');