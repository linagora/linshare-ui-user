/**
 * documentPreviewNavigation Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewNavigation', {
      templateUrl: function(componentsConfig) {
        return componentsConfig.path +
          'documentPreviewButton/components/documentPreviewNavigation/documentPreviewNavigation.html';
      },
      controller: 'DocumentPreviewNavigationController',
      controllerAs: 'documentPreviewNavigationVm',
      bindings: {
        items: '<',
        index: '<'
      }
    });
})();
