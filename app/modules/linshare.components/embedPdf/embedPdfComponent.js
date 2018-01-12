/**
 * embedPdf Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('embedPdf', {
      templateUrl: function(componentsConfig) {
        return componentsConfig.path + 'embedPdf/embedPdf.html';
      },
      bindings: {
        src: '<'
      }
    });
})();
