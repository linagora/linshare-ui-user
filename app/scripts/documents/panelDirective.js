'use strict';

angular.module('linshareUiUserApp')
  .directive('panelFilesDetail', function() {
    return {
      scope: true,
      transclude: true,
      link: function(scope, element, attr, ctrl) {
        element.parent().bind('click', function(){
          if(scope.selected == false)
            element.parent().toggleClass('panel');

        });
        scope.$watch('selected', function(newValue, oldValue) {
          if(newValue === true) {
            console.log('dir', element.find('span'));
            if(element.parent().hasClass('panel')){

            }else {

            element.parent().addClass('panel');
            }
          } else {
            console.log('remove');
            element.parent().removeClass('panel');
          }
        });
      }
    }
  });
