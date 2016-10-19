(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('sidebarContent', sidebarContentDirective);

  function sidebarContentDirective() {
    return {
      restrict: 'A',
      templateUrl: function(elm, attr) {
        return 'modules/linshare.document/directives/sidebarContent/sidebarContent-' + attr.sidebarContent + '.html';
      }
    };
  }
})();
