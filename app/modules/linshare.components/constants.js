(function() {
  'use strict';

  /* jshint undef: true */
  /* global _:false, $:false, moment:false*/
  angular
    .module('linshare.components')
    .constant('moment', moment)
    .constant('$', $)
    .constant('_', _)
  /**
   * Configuration object utils for components
   * @typedef {Object} ComponentsConfig
   * @property {string} path - Path to root folder of module linshare.components
   */
    .constant('componentsConfig', {
      path: 'modules/linshare.components/'
    });
})();
