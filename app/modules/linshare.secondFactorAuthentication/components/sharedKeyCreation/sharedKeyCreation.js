/**
 * SharedKeyCreation Component
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .component('sharedKeyCreation', {
      template: require('./sharedKeyCreation.html'),
      controller: 'sharedKeyCreationController',
      controllerAs: 'sharedKeyCreationVm',
      bindings: {
        feature: '<',
        user: '<'
      }
    });
})();
