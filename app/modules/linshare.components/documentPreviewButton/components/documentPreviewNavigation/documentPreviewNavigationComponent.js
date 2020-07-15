/**
 * documentPreviewNavigation Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewNavigation', {
      template: require('./documentPreviewNavigation.html'),
      controller: 'DocumentPreviewNavigationController',
      controllerAs: 'documentPreviewNavigationVm',
      bindings: {
        items: '<',
        index: '<'
      }
    });
})();
