(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('sidebarContent', sidebarContentDirective);

  function sidebarContentDirective() {
    return {
      restrict: 'A',
      templateUrl: function(elm, attr) {
        return 'directives/sidebar-content/sidebar-content-' + attr.sidebarContent + '.html';
      }
    };
  }
})();
