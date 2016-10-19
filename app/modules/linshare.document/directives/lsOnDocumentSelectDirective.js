(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('lsOnDocumentSelect', lsOnDocumentSelectDirective);

  function lsOnDocumentSelectDirective() {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element) {
        element.bind('contextmenu', function() {
          var isHighlighted = element.hasClass('highlight-list-elem');
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
      controller: lsOnDocumentSelectController
    };

    function lsOnDocumentSelectController($scope) {
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
      };
    }
  }
})();
