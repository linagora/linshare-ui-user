/**
 * documentPreviewToolbar Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewToolbar', {
      templateUrl: templateUrl,
      controller: 'DocumentPreviewToolbarController',
      controllerAs: 'documentPreviewToolbarVm',
      bindings: {
        index: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf  linshare.components.documentPreviewButton.components.documentPreviewToolbar
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path +
      'documentPreviewButton/components/documentPreviewToolbar/documentPreviewToolbar.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
