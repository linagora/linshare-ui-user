(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('newUploadBounce', newUploadBounceDirective);

  function newUploadBounceDirective() {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        scope.$on('flow::filesSubmitted', function() {
          elem.show(0, function() {
            elem.addClass('active-anim-transfert-icon');
          }).delay(3000).hide(0, function() {
            elem.removeClass('active-anim-transfert-icon');
          });
        });
      }
    };
  }
})();

