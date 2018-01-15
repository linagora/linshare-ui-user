/**
 * documentPreviewToolbarButtons Component
 * @namespace linshare.components.documentPreviewButton.components.documentPreviewToolbar.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewToolbarButtons', {
      templateUrl: templateUrl,
      bindings: {
        scope: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.documentPreviewButton.components.documentPreviewToolbar.components
   *           .documentPreviewToolbarButtons
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path +
      'documentPreviewButton/components/'+
      'documentPreviewToolbar/components/'+
      'documentPreviewToolbarButtons/documentPreviewToolbarButtons.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
