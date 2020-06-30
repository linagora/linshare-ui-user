/**
 * sharedKeyRemoval Component
 * @namespace linshare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .component('sharedKeyRemoval', {
      templateUrl: 'modules/linshare.secondFactorAuthentication/components/sharedKeyRemoval/sharedKeyRemoval.html',
      controller: 'sharedKeyRemovalController',
      controllerAs: 'sharedKeyRemovalVm',
      bindings: {
        feature: '<',
        user: '<'
      }
    });
})();
