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
      template: require('./documentPreviewButton.html'),
      controller: 'DocumentPreviewButtonController',
      controllerAs: 'documentPreviewButtonVm',
      bindings: {
        itemIndex: '<',
        items: '<',
        icon: '<'
      }
    });
})();
