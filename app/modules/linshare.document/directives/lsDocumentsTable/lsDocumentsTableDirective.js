(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('lsDocumentsTable', lsDocumentsTableDirective);

  function lsDocumentsTableDirective() {
    return {
      restrict: 'E',
      template: require('./lsDocumentsTable.html')
    };
  }
})();
