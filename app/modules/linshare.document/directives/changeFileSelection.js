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
  .directive('lsOnDocumentSelect', function(LinshareDocumentService) {
    return {
      restrict: 'A',
      scope: {
        fileSelectionV: '=',
        documentFile: '=uuid',
        currentSelectedDocument: '=',
        multipleSelectOn: '='
      },
      link: function(scope, element, attr) {
        element.bind('contextmenu', function(event) {
        var classes =  angular.element(this).attr('class');
          var isHighlighted = angular.element(this).hasClass("highlightListElem");
          if(!isHighlighted){
            setSelected();
          }
        });
        element.bind('click', function() {
          setSelected();
        });
        function setSelected(){
          if(scope.multipleSelectOn === true) {
            element.toggleClass('highlightListElem');
            if(element.hasClass('highlightListElem')) {
              scope.documentFile['isSelected'] = true;
              scope.$apply(function() {
                scope.currentSelectedDocument.current = scope.documentFile;
                scope.fileSelectionV.push(scope.documentFile);
              });
            } else {
              scope.documentFile['isSelected'] = false;
              var indexMulSelect = scope.fileSelectionV.indexOf(scope.documentFile);
              if (indexMulSelect > -1) {
                scope.$apply(function() {
                  scope.fileSelectionV.splice(indexMulSelect, 1);
                  scope.currentSelectedDocument.current = scope.fileSelectionV[scope.fileSelectionV.length -1];
                });
              }
            }
          } else {
            element.siblings('.info').removeClass('info');
            if(scope.fileSelectionV.length > 1) {
              element.addClass('info');
              scope.$apply(function() {
                scope.fileSelectionV.splice(0, scope.fileSelectionV.length);
                scope.fileSelectionV.push(scope.documentFile);
              });
            } else {
              element.toggleClass('info');
              if(element.hasClass('info')) {
                if(scope.documentFile.hasThumbnail === true && attr.sidebar === 'true') {
                  LinshareDocumentService.getThumbnail(scope.documentFile.uuid).then(function(thumbnail) {
                    scope.documentFile.thumbnail = thumbnail;
                  });
                }
                if(scope.documentFile.shared > 0) {
                  LinshareDocumentService.getFileInfo(scope.documentFile.uuid).then(function(data) {
                    scope.documentFile.shares = data.shares;
                  });
                }
                scope.$apply(function() {
                  scope.fileSelectionV.shift();
                  scope.fileSelectionV.push(scope.documentFile);
                });
              } else {
                var indexOneSelect = scope.fileSelectionV.indexOf(scope.documentFile);
                if (indexOneSelect > -1) {
                  scope.$apply(function() {
                    scope.fileSelectionV.splice(indexOneSelect, 1);
                  });
                }
              }
            }
          }
        }
      }

    };
  })
  .directive('sidebarContent', function($parse) {
    return {
      restrict: 'A',
      templateUrl: function(elm, attr) {
        return 'modules/linshare.document/directives/sidebarContent-'+attr.sidebarContent+'.html';
      }
    }
  });
