/**
 * documentPreviewToolbarButtons Component
 * @namespace linshare.components.documentPreviewButton.components.documentPreviewToolbar.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewToolbarButtons', {
      template: require('./documentPreviewToolbarButtons.html'),
      bindings: {
        scope: '<'
      }
    });
})();
