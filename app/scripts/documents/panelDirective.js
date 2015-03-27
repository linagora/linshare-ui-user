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
        //element.parent().bind('click', function() {
        //  scope.selected = !scope.selected;
        //  //if(scope.selected === false) {
        //  //  element.parent().toggleClass('info');
        //  //  //if (element.parent().hasClass('panel')){
        //  //  //  console.log('scope open');
        //  //  //  scope.open = true;
        //  //  //}
        //  //}
        //});
        //element.parent().bind('mouseenter mouseleave', function(){
        //  element.parent().toggleClass('panel');
        //});

        scope.$watch('selected', function(newValue, oldValue) {
          if(newValue === true) {

            scope.SelectedElement.push(scope.o.uuid);
            console.log('TESTE', 'scope.objects');
            console.log('dir', element.find('span'));
            if(element.parent().hasClass('panel')){

            } else {
              element.parent().addClass('info');
            }
          }
          if(newValue === false) {
            console.log('remove', element.parent());
            element.parent().removeClass('info');
            console.log('MY SZLZX', scope.SelectedElement);
            var removed = _.remove(scope.SelectedElement, function(n){
              return n == scope.SelectedElement;
            });
            console.log('remodev element',removed);
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
