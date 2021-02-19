(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .constant('SECOND_FA_REQUIRED_TRANSITION_STATES', {
      from: [
        '', //initial load or reload
        'login',
        'secondFactorAuthentication'
      ]
    });
})();
