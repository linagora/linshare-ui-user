/**
 * embedPdf Component
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .component('embedPdf', {
      template: require('./embedPdf.html'),
      bindings: {
        src: '<'
      }
    });
})();
