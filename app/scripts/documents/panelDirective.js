'use strict';

angular.module('linshareUiUserApp')
  .directive('panelFilesDetail', function() {
    return {
      scope: false,
      //transclude: true,
      link: function(scope, element, attr, ctrl) {
        console.log('link scope',scope.selected);
        console.log('scope from checkbox', scope.selected);
        //scope.selected = false;
        element.parent().bind('click', function() {
          if(scope.selected === false){
            element.parent().toggleClass('panel');
            if (element.parent().hasClass('panel')){
              console.log('scope open');
              scope.open = true;
            }
          }
        });
        scope.$watch('selected', function(newValue, oldValue) {
          if(newValue === true) {
            console.log('dir', element.find('span'));
            if(element.parent().hasClass('panel')){

            } else {
            element.parent().addClass('panel');
            }
          } else {
            console.log('remove', element.parent());
            element.parent().removeClass('panel');
          }
        });
        scope.$watch('open', function(n, o) {
          if(n === true){
            console.log('treue');
          }
        })
      }
    }
  });
