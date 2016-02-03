'use strict';

angular.module('linshare.document')
  .directive('fileSelection', function() {
    return {
      restrict: 'A',
      scope: {
        fileSelection: '=',
        uuid: '='
      },
      link: function(scope, element) {
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
  .directive('lsOnDocumentSelect', function(LinshareDocumentService){
    return {
      restrict: 'A',
      scope: {
        fileSelectionV: '=',
        currentDocument: '=uuid',
        multipleSelectOn: '='
      },
      link: function(scope, element, attr) {
        element.bind('click', function() {
          if(scope.multipleSelectOn === true) {
            element.toggleClass('info');
            if(element.hasClass('info')) {
              scope.current = scope.currentDocument;
              scope.$apply(function() {
                scope.fileSelectionV.push(scope.currentDocument);
              });
            } else {
              scope.current = {};
              var indexMulSelect = scope.fileSelectionV.indexOf(scope.currentDocument);
              if (indexMulSelect > -1) {
                scope.$apply(function() {
                  scope.fileSelectionV.splice(indexMulSelect, 1);
                });
              }
            }
          } else {
              element.siblings('.info').removeClass('info');
              if(scope.fileSelectionV.length > 1) {
                element.addClass('info');
                scope.$apply(function() {
                  scope.fileSelectionV.splice(0, scope.fileSelectionV.length);
                  scope.fileSelectionV.push(scope.currentDocument);
                });
              } else {
                  element.toggleClass('info');
                  if(element.hasClass('info')) {
                    if(scope.currentDocument.hasThumbnail === true && attr.sidebar === 'true') {
                      LinshareDocumentService.getThumbnail(scope.currentDocument.uuid).then(function(thumbnail) {
                        scope.currentDocument.thumbnail = thumbnail;
                      });
                    }
                    if(scope.currentDocument.shared > 0) {
                      LinshareDocumentService.getFileInfo(scope.currentDocument.uuid).then(function(data) {
                        scope.currentDocument.shares = data.shares;
                      });
                    }
                    scope.$apply(function() {
                      scope.fileSelectionV.shift();
                      scope.fileSelectionV.push(scope.currentDocument);
                    });
                  } else {
                      var indexOneSelect = scope.fileSelectionV.indexOf(scope.currentDocument);
                      if (indexOneSelect > -1) {
                        scope.$apply(function() {
                          scope.fileSelectionV.splice(indexOneSelect, 1);
                        });
                      }
                  }
              }
          }
        });
      }
    };
  });
