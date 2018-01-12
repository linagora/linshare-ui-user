/**
 * documentPreviewButton Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewButton', {
      transclude: true,
      templateUrl: function(componentsConfig) {
        return componentsConfig.path + 'documentPreviewButton/documentPreviewButton.html';
      },
      controller: 'DocumentPreviewButtonController',
      controllerAs: 'documentPreviewButtonVm',
      bindings: {
        itemIndex: '<',
        items: '<'
      }
    });
})();
