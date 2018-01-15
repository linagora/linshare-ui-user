/**
 * embedPdf Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('embedPdf', {
      templateUrl: templateUrl,
      bindings: {
        src: '<'
      }
    });

  /**
   * @name templateUrl
   * @desc Retrieve the URL template of the component
   * @param {ComponentsConfig} componentsConfig - Configuration object utils for components
   * @memberOf linshare.components.embedPdf
   */
  function templateUrl(componentsConfig) {
    return componentsConfig.path + 'embedPdf/embedPdf.html';
  }

  templateUrl.$inject = ['componentsConfig'];
})();
