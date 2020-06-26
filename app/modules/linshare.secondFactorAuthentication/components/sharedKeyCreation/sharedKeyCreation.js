/**
 * SharedKeyCreation Component
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .component('sharedKeyCreation', {
      templateUrl: 'modules/linshare.secondFactorAuthentication/components/sharedKeyCreation/sharedKeyCreation.html',
      controller: 'sharedKeyCreationController',
      controllerAs: 'sharedKeyCreationVm',
      bindings: {
        feature: '<',
        userMail: '<'
      }
    });
})();
