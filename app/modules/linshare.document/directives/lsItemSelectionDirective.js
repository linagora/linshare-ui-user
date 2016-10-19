(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('lsItemSelection', lsItemSelectionDirective);

  function lsItemSelectionDirective($log) {
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
          var isHighlighted = element.hasClass('highlight-list-elem');
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
      controller: lsItemSelectionController
    };

    function lsItemSelectionController($scope) {
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
      };
    }
  }
})();
