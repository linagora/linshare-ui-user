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

          if(scope.selected === false || scope.selected == undefined) {
            element.parent().toggleClass('info');
            //if (element.parent().hasClass('panel')){
            //  console.log('scope open');
            //  scope.open = true;
            //}
          }
          else {
            scope.selected = false;
          }
        });
        element.parent().bind('mouseenter mouseleave', function(){
          element.parent().toggleClass('panel');
        });

        scope.$watch('selected', function(newValue, oldValue) {
          if(newValue === true) {

            scope.SelectedElement.push(scope.o.uuid);
            console.log('SELECTED ELEMENT', scope.SelectedElement);
            //console.log('dir', element.find('span'));
            if(element.parent().hasClass('info')){

            } else {
              console.log('adding class info');
              element.parent().addClass('info');
            }
          }
          if(newValue === false) {
            console.log('remove class info', element.parent());
            element.parent().removeClass('info');
            console.log('MY SZLZX', scope.SelectedElement);
            var index = scope.SelectedElement.indexOf(scope.o.uuid);
            if (index >-1){
              console.log('index', index);
              scope.SelectedElement.splice(index, 1);
            }
            console.log(index);
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
