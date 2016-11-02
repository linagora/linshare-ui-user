(function() {
  'use strict';

  angular
    .module('linshare.document')
    .controller('selectedDocumentsController', selectedDocumentsController);

  selectedDocumentsController.$inject = ['lsAppConfig'];

  function selectedDocumentsController($scope, $stateParams, lsAppConfig) {
    var isMobile = angular.element('html').hasClass('ismobile');
    var param = $stateParams.selected;

    $scope.currentPage = '';
    $scope.lengthOfSelectedDocuments = lengthOfSelectedDocuments;
    $scope.loadSidebarContent = loadSidebarContent;
    $scope.removeSelectedDocuments = removeSelectedDocuments;
    $scope.selectedFlowIdentifiers = $stateParams.selected;

    activate();

    ////////////////

    function activate() {
      if (isMobile) {
        resetMobileState();
      }

      angular.element(window).resize(function() {
        resetMobileState();
      });

      angular.forEach(param, function(n) {
        $scope.selectedDocuments.push(n);
      });
      $scope.loadSidebarContent(lsAppConfig.share);
    }

    /* For the mobile user flow : the sidebar  is hidden at first ( when the page loads up )*/
    function resetMobileState() {
      $scope.mainVm.sidebar.hide();
      angular.element('#collapsible-content').removeClass('set-width');
    }

    function lengthOfSelectedDocuments() {
      return $scope.selectedDocuments.length + Object.keys($scope.selectedUploads).length;
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} cotent The id of the content to load, see app/views/includes/sidebar-right.html for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData($scope);
      if (content !== undefined) {
        $scope.mainVm.sidebar.setContent(content);
      }
      $scope.mainVm.sidebar.show();
    }

    function removeSelectedDocuments(document) {
      var index = $scope.selectedDocuments.indexOf(document);
      if (index > -1) {
        document.isSelected = false;
        $scope.selectedDocuments.splice(index, 1);
      }
    }
  }
})();
