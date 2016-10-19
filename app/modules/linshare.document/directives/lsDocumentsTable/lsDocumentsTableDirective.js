(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('lsDocumentsTable', lsDocumentsTableDirective);

  function lsDocumentsTableDirective() {
    return {
      restrict: 'E',
      templateUrl: 'modules/linshare.document/directives/lsDocumentsTable/lsDocumentsTable.html'
    };
  }
})();
