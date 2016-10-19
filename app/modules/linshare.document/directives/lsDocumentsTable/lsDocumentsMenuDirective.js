(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('lsDocumentsMenu', lsDocumentsMenuDirective);

  function lsDocumentsMenuDirective() {
    return {
      restrict: 'E',
      templateUrl: 'modules/linshare.document/directives/lsDocumentsTable/lsDocumentsMenu.html'
    };
  }
})();
