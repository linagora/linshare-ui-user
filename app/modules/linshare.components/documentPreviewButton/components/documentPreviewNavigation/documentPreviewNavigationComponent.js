/**
 * documentPreviewNavigation Component
 * @namespace linshare.components.documentPreviewButton.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('documentPreviewNavigation', {
      templateUrl: templateUrl,
      controller: 'DocumentPreviewNavigationController',
      controllerAs: 'documentPreviewNavigationVm',
      bindings: {
        items: '<',
        index: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.documentPreviewButton.components.documentPreviewNavigation
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path +
      'documentPreviewButton/components/documentPreviewNavigation/documentPreviewNavigation.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
