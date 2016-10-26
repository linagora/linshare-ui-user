'use strict';

angular.module('linshareUiUserApp')

  .directive('hoverDropdownFix', function() {
    return {
      restrict: 'A',
      link: function(scope, el) {
        scope.$watch(function() {
          return el.hasClass('open');
        }, function(newValue,closeDropdown) {
          if (closeDropdown) {
            angular.element('.uib-dropdown-menu.open').removeClass('open');
          }
          if (newValue) {
            angular.element('.uib-dropdown-menu').each(function() {
              var state= angular.element(this).css('display');
              if (state === 'block') {
                angular.element(this).addClass('open');
              }
            });
            angular.element(el).parent().addClass('setVisible');
          }else{
            angular.element(el).parent().removeClass('setVisible');
          }
        });
      }
    };
  });
