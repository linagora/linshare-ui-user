(function() {
  'use strict';

  angular
    .module('linshare.document')
    .controller('selectedDocumentsController', selectedDocumentsController);

  selectedDocumentsController.$inject = [];

  function selectedDocumentsController($scope, $stateParams) {
    $scope.selectedFlowIdentifiers = $stateParams.selected;

    $scope.lengthOfSelectedDocuments = lengthOfSelectedDocuments;
    $scope.mactrl.sidebarToggle.right = true;

    $scope.$parent.sidebarRightDataType = 'share';
    $scope.currentPage = '';
    var param = $stateParams.selected;
    angular.forEach(param, function(n) {
      $scope.selectedDocuments.push(n);
    });
    $scope.sidebarRightDataType = 'active-share-details';
    $scope.removeSelectedDocuments = removeSelectedDocuments;
    /* For the mobile user flow : the sidebar  is hidden at first ( when the page loads up )*/
    function resetMobileState() {
      $scope.mactrl.sidebarToggle.right = false;
      angular.element('#collapsible-content').removeClass('setWidth');
    }

    var isMobile = angular.element('html').hasClass('ismobile');
    if(isMobile) {
      resetMobileState();
    }
    angular.element(window).resize(function() {
      resetMobileState();
    });

    function lengthOfSelectedDocuments() {
      return $scope.selectedDocuments.length + Object.keys($scope.selectedUploads).length;
    }

    function removeSelectedDocuments(document) {
      var index = $scope.selectedDocuments.indexOf(document);
      if(index > -1) {
        document.isSelected = false;
        $scope.selectedDocuments.splice(index, 1);
      }
    }
  }
})();
