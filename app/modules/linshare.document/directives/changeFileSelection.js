'use strict';

angular.module('linshare.document')
  .directive('fileSelection', function($log) {
    return {
      restrict: 'A',
      scope: {
        fileSelection: '=',
        uuid: '='
      },
      link: function(scope, element, attr, ctrl) {
        element.on('change', function(){
          element.parent().parent().toggleClass('info');
          if(element.is(':checked')) {
            scope.$apply(function() {
              scope.fileSelection.push(scope.uuid);
            });

          }
          else {
            var index = scope.fileSelection.indexOf(scope.uuid);
            if (index > -1) {
              scope.$apply(function() {
                scope.fileSelection.splice(index, 1);
              });
            }
          }
        });
      }
    };
  })
  .directive('fileSelectionV', function(){
    return {
      restrict: 'A',
      scope: {
        fileSelectionV: '=',
        uuid: '='
      },
      link: function(scope, element, attr, ctrl) {
        element.bind('click', function() {
          element.toggleClass('info');
          if(element.hasClass('info')) {
            scope.current = scope.uuid;
            console.log('heas class', scope.fileSelectedV, scope.documentDetails);
            scope.$apply(function() {
              scope.fileSelectionV.push(scope.uuid);
            });
          } else {
            scope.current = {};
            var index = scope.fileSelectionV.indexOf(scope.uuid);
            if (index > -1) {
              scope.$apply(function() {
                scope.fileSelectionV.splice(index, 1);
              });
            }
          }
          });
        }
      }
  });

