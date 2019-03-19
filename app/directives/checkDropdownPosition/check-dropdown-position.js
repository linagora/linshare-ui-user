(function() {
    'use strict';
  
    angular
      .module('linshare.document')
      .directive('checkDropdownPosition', checkDropdownPosition);
  
    function checkDropdownPosition() {
      return {
        restrict: 'A',
        link: checkDropdownPositionLink
      };
  
      function checkDropdownPositionLink(scope, elem, attrs) {
        elem.find('a.dropdown-toggle').bind('click', function() {
          var dropdown = angular.element('ul.uib-dropdown-menu').last();
          var dropdownHeight= dropdown.height();
  
          if(window.innerHeight - elem[0].getBoundingClientRect().bottom < dropdownHeight) {
            var newDropdownPostion = dropdownHeight + 40;
            dropdown.css('top', '-=' + newDropdownPostion);
          }
        });

        scope.$on('$destroy', function() {
          elem.find('a.dropdown-toggle').unbind('click');
        });
      }
    }
  })();
  