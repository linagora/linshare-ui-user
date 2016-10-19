(function() {
  'use strict';

  angular
    .module('linshare.upload')
    .directive('lsUploadQueue', lsUploadQueueDirective);

  function lsUploadQueueDirective() {
    return {
      restrict: 'E',
      templateUrl: 'modules/linshare.upload/directives/lsUploadQueue/lsUploadQueue.html',
      scope: true,
      link: function(scope, elem, attrs) {
        scope.fromWhere = attrs.fromWhere;
      }
    };
  }
})();
