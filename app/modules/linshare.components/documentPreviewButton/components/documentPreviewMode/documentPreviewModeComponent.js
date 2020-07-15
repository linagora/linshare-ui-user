/**
 * documentPreviewMode Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewMode', {
      template: require('./documentPreviewMode.html'),
      controller: 'DocumentPreviewModeController',
      controllerAs: 'documentPreviewModeVm',
      bindings: {
        index: '<'
      }
    });
})();
