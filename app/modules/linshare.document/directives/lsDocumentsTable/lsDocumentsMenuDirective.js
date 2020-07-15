(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('lsDocumentsMenu', lsDocumentsMenuDirective);

  function lsDocumentsMenuDirective() {
    return {
      restrict: 'E',
      template: require('./lsDocumentsMenu.html')
    };
  }
})();
