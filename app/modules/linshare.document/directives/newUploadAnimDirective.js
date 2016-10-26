(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('newUploadAnim', newUploadAnimDirective);

  function newUploadAnimDirective() {
    return function(scope, element) {
      if (scope.isNewAddition) {
        if (scope.$first) {
          angular.element(element).addClass('set-hidden-anim').delay(200).queue(function() {
            $(this).addClass('anim-in');
          });
          scope.isNewAddition = false;
        } else {
          scope.isNewAddition = false;
        }
      }
    };
  }
})();

