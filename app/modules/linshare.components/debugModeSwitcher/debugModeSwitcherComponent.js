/**
 * debugModeSwitcher Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('debugModeSwitcher', {
      template: require('./debugModeSwitcher.html'),
      controller: 'DebugModeSwitcherController',
      controllerAs: 'debugModeSwitcherVm',
    });
})();
