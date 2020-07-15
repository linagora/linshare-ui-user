/**
 * documentPreviewToolbar Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewToolbar', {
      template: require('./documentPreviewToolbar.html'),
      controller: 'DocumentPreviewToolbarController',
      controllerAs: 'documentPreviewToolbarVm',
      bindings: {
        index: '<'
      }
    });
})();
