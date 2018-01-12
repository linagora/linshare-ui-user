/**
 * documentPreviewToolbar Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewToolbar', {
      templateUrl: function(componentsConfig) {
        return componentsConfig.path +
          'documentPreviewButton/components/documentPreviewToolbar/documentPreviewToolbar.html';
      },
      controller: 'DocumentPreviewToolbarController',
      controllerAs: 'documentPreviewToolbarVm',
      bindings: {
        index: '<'
      }
    });
})();
