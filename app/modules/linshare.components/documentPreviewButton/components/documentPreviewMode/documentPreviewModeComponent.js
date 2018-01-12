/**
 * documentPreviewMode Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewMode', {
      templateUrl: function(componentsConfig) {
        return componentsConfig.path + 'documentPreviewButton/components/documentPreviewMode/documentPreviewMode.html';
      },
      controller: 'DocumentPreviewModeController',
      controllerAs: 'documentPreviewModeVm',
      bindings: {
        index: '<'
      }
    });
})();
