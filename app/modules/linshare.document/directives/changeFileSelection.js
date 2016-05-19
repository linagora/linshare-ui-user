'use strict';

angular.module('linshare.document')

  // DIRECTIVE TO TOGGLE DOCUMENT SELECTION
  .directive('lsOnDocumentSelect', function(LinshareDocumentService) {
    var toggleDocumentSelection = function(scope) {
      scope.currentSelectedDocument.current = scope.documentFile;
      scope.documentFile.isSelected = !scope.documentFile.isSelected;
      if(scope.documentFile.isSelected) {
        if(scope.sidebarRight) {
          if(scope.documentFile.shared > 0) {
            LinshareDocumentService.getFileInfo(scope.documentFile.uuid).then(function(data) {
              scope.currentSelectedDocument.current.shares = data.shares;
            });
          }
          if(scope.documentFile.hasThumbnail === true) {
            LinshareDocumentService.getThumbnail(scope.documentFile.uuid).then(function(thumbnail) {
              scope.currentSelectedDocument.current.thumbnail = thumbnail;
            });
          }
        }
        scope.$apply(function() {
          scope.selectedDocuments.push(scope.documentFile);
        });
      } else {
        var indexMulSelect = scope.selectedDocuments.indexOf(scope.documentFile);
        if(indexMulSelect > -1) {
          scope.$apply(function() {
            scope.selectedDocuments.splice(indexMulSelect, 1);
          });
        }
      }
    };

    return {
      restrict: 'A',
      scope: {
        selectedDocuments: '=fileSelectionV',
        documentFile: '=uuid',
        currentSelectedDocument: '=',
        sidebarRight: '='
      },
      link: function(scope, element) {
        element.bind('contextmenu', function() {
          var isHighlighted = element.hasClass('highlightListElem');
          if(!isHighlighted) {
            toggleDocumentSelection(scope);
          }
        });
        element.bind('click', function() {
          if(scope.sidebarRight) {
            element.siblings().find('li.activeActionButton').removeClass('activeActionButton');
            element.find('li')[0].className = 'activeActionButton';
          }
          toggleDocumentSelection(scope);
        });
      }
    };
  })

  // DIRECTIVE TO TOGGLE A CURRENT UPLOAD SELECTION
  .directive('lsOnUploadSelect', function() {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element) {
        element.bind('click', function() {
          scope.file.isSelected = !scope.file.isSelected;
          if(scope.file.isSelected) {
            scope.selectedUploadedFiles[scope.file.uniqueIdentifier] = {name: scope.file.name}
          } else {
            delete scope.selectedUploadedFiles[scope.file.uniqueIdentifier];
          }
          scope.$apply();
        })
      }
    }
  })

  //DIRECTIVE TO DISPLAY DIFFERENT CONTENTS INSIDE THE RIGHT SIDEBAR
  .directive('sidebarContent', function() {
    return {
      restrict: 'A',
      templateUrl: function(elm, attr) {
        return 'modules/linshare.document/directives/sidebarContent-' + attr.sidebarContent + '.html';
      }
    };
  });
