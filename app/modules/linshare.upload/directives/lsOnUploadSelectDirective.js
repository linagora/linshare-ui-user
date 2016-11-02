(function() {
  'use strict';

  angular
    .module('linshare.upload')
    .directive('lsOnUploadSelect', lsOnUploadSelectDirective);

  function lsOnUploadSelectDirective() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.bind('click', function() {
          scope.file.isSelected = !scope.file.isSelected;
          if (scope.file.isSelected) {
            scope.selectedUploads[scope.file.uniqueIdentifier] = {
              name: scope.file.name,
              size: scope.file.size,
              type: scope.file.getType()
            };
          } else {
            delete scope.selectedUploads[scope.file.uniqueIdentifier];
          }
          scope.$apply();
        });
      }
    };
  }
})();
