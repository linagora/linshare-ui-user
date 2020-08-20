/**
 * qrcode Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('qrcode', qrcode);

  function qrcode() {
    return {
      restrict: 'E',
      scope: {
        text: '@',
        size: '@',
      },
      template: '<div class="qrcode-container"></div>',
      link: function(scope, elm, attrs) {
        if (attrs.logoImageSrc) {
          angular.element(elm[0]).find('.qrcode-container').append('<img src="'+ attrs.logoImageSrc + '"></img>')
        }

        angular.element(elm[0]).find('.qrcode-container').qrcode({
          text: scope.text,
          width: scope.size,
          height: scope.size,
        });
      }
    }
  }
})();
