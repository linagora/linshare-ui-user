/**
 * documentPreviewMode Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewMode', {
      templateUrl: templateUrl,
      controller: 'DocumentPreviewModeController',
      controllerAs: 'documentPreviewModeVm',
      bindings: {
        index: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.documentPreviewButton.components.documentPreviewMode
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path + 'documentPreviewButton/components/documentPreviewMode/documentPreviewMode.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
