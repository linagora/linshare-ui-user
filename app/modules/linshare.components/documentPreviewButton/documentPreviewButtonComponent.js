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
      templateUrl: templateUrl,
      controller: 'DocumentPreviewButtonController',
      controllerAs: 'documentPreviewButtonVm',
      bindings: {
        itemIndex: '<',
        items: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.documentPreviewButton.components.documentPreviewButton
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path + 'documentPreviewButton/documentPreviewButton.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
