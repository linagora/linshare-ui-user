'use strict';

angular.module('linshare.document')

  // DIRECTIVE TO TOGGLE DOCUMENT SELECTION
  .directive('lsOnDocumentSelect', function() {


    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element) {
        element.bind('contextmenu', function() {
          var isHighlighted = element.hasClass('highlightListElem');
          if(!isHighlighted) {
            scope.toggleDocumentSelection();
          }
        });
        element.bind('click', function() {
          if(scope.mactrl.sidebarToggle.right) {
            element.siblings().find('li.activeActionButton').removeClass('activeActionButton');
            element.find('li')[0].className = 'activeActionButton';
          }
          scope.toggleDocumentSelection();
        });
      },
      controller: function($scope) {
        $scope.toggleDocumentSelection = function() {
          $scope.currentSelectedDocument.current = $scope.documentFile;
          $scope.documentFile.isSelected = !$scope.documentFile.isSelected;
          if($scope.documentFile.isSelected) {
            if($scope.mactrl.sidebarToggle.right) {
              if($scope.documentFile.shared > 0) {
                $scope.getDocumentInfo($scope.documentFile.uuid);
              }
              if($scope.documentFile.hasThumbnail === true) {
                $scope.getDocumentThumbnail($scope.documentFile.uuid);
              }
            }
            $scope.$apply(function() {
              $scope.selectedDocuments.push($scope.documentFile);
            });
          } else {
            var indexMulSelect = $scope.selectedDocuments.indexOf($scope.documentFile);
            if(indexMulSelect > -1) {
              $scope.$apply(function() {
                $scope.selectedDocuments.splice(indexMulSelect, 1);
              });
            }
          }
        }
      }
    };

    // function toggleDocumentSelection(scope) {
    //   scope.currentSelectedDocument.current = scope.documentFile;
    //   scope.documentFile.isSelected = !scope.documentFile.isSelected;
    //   if(scope.documentFile.isSelected) {
    //     if(scope.mactrl.sidebarToggle.right) {
    //       if(scope.documentFile.shared > 0) {
    //         scope.getDocumentInfo(scope.documentFile.uuid);
    //       }
    //       if(scope.documentFile.hasThumbnail === true) {
    //         scope.getDocumentThumbnail(scope.documentFile.uuid);
    //       }
    //     }
    //     scope.$apply(function() {
    //       scope.selectedDocuments.push(scope.documentFile);
    //     });
    //   } else {
    //     var indexMulSelect = scope.selectedDocuments.indexOf(scope.documentFile);
    //     if(indexMulSelect > -1) {
    //       scope.$apply(function() {
    //         scope.selectedDocuments.splice(indexMulSelect, 1);
    //       });
    //     }
    //   }
    // }
  })

  .directive('lsItemSelection', function($log) {

    return {
      restrict: 'A',
      scope: {
        selectedDocuments:'=',
        currentSelectedDocument: '=',
        item: '=documentFile',
        detailsFunction: '=',
        rightSidebarOpen: '='
      },
      link: function(scope, element) {
        element.bind('contextmenu', function() {
          var isHighlighted = element.hasClass('highlightListElem');
          if(!isHighlighted) {
            scope.toggleDocumentSelection();
          }
        });
        element.bind('click', function() {
          $log.debug('directive itemselection : click event');
          if(scope.rightSidebarOpen) {
            element.siblings().find('li.activeActionButton').removeClass('activeActionButton');
            element.find('li')[0].className = 'activeActionButton';
          }
          scope.toggleDocumentSelection();
        });
      },
      controller: function($scope) {
        $scope.toggleDocumentSelection = function() {
          $scope.currentSelectedDocument.current = $scope.item;
          var multipleSelection = false;
          if(multipleSelection) {
            // code goes here when implementing the multiple selection
          }
          if($scope.rightSidebarOpen) {
            $scope.detailsFunction($scope.item).then(function(details) {
              $scope.currentSelectedDocument.current = details;
            });
          }
          $scope.$apply();
        }
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
            scope.selectedUploads[scope.file.uniqueIdentifier] = {
              name: scope.file.name,
              size: scope.file.size,
              type: scope.file.getType()
            };
          } else {
            delete scope.selectedUploads[scope.file.uniqueIdentifier];
          }
          scope.$apply();
        });
      }
    };
  })

  // DIRECTIVE TO DISPLAY DIFFERENT CONTENTS INSIDE THE RIGHT SIDEBAR
  .directive('sidebarContent', function() {
    return {
      restrict: 'A',
      templateUrl: function(elm, attr) {
        return 'modules/linshare.document/directives/sidebarContent-' + attr.sidebarContent + '.html';
      }
    };
  });
