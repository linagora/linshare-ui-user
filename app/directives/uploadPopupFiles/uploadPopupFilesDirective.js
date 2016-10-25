(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('uploadPopupFiles', uploadPopupFilesDirective);

  function uploadPopupFilesDirective() {
    return {
      restrict: 'A',
      templateUrl: 'directives/uploadPopupFiles/uploadPopupFiles.html',
      scope: true,
      link: function(scope, elem, attrs) {
        var totalFilesFrom;
        scope.fromWhere = attrs.uploadPopupFiles;
        elem.hide();
        scope.$watch('filesFilterred', function() {
          scope.filesFilterred.length > 0 ? elem.show() : elem.hide();
          totalFilesFrom = _.filter(scope.$flow.files, {'_from': scope.fromWhere});
          scope.currentFilesLength = totalFilesFrom ? totalFilesFrom.length : 0;
        });
      }
    }
  }
})();
