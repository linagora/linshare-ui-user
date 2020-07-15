/**
 * sharedKeyRemoval Component
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .component('sharedKeyRemoval', {
      template: require('./sharedKeyRemoval.html'),
      controller: 'sharedKeyRemovalController',
      controllerAs: 'sharedKeyRemovalVm',
      bindings: {
        feature: '<',
        user: '<'
      }
    });
})();
