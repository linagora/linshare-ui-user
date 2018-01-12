/**
 * documentPreviewToolbarButtons Component
 * @namespace linshare.components.documentPreviewButton.components.documentPreviewToolbar.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewToolbarButtons', {
      templateUrl: function(componentsConfig) {
        return componentsConfig.path +
          'documentPreviewButton/components/'+
          'documentPreviewToolbar/components/'+
          'documentPreviewToolbarButtons/documentPreviewToolbarButtons.html';
      },
      bindings: {
        scope: '<'
      }
    });
})();
