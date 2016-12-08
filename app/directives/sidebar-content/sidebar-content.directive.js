/**
 * sidebarContent Directive
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('sidebarContent', sidebarContentDirective);

  /**
   *  @namespace sidebarContentDirective
   *  @desc Return the template to display in right sidebar
   *  @memberOf linshareUiUserApp
   */
  function sidebarContentDirective() {
    return {
      restrict: 'A',
      templateUrl: templateUrlFunc
    };
  }

  /**
   *  @namespace linkFunc
   *  @desc TemplateUrl function of sidebarContent Directive
   *  @param {Object} elem - jqLite-wrapped element that this directive matches
   *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
   *  @memberOf linshareUiUserApp
   */
  function templateUrlFunc(elem, attrs) {
    return 'directives/sidebar-content/sidebar-content-' + attrs.sidebarContent + '.html';
  }
})();
