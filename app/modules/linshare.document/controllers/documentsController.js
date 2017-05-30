(function() {
  'use strict';

  angular
    .module('linshare.document')
    .controller('documentsController', documentsController);

  documentsController.$inject = ['$scope', '$translatePartialLoader', 'lsAppConfig'];

  function documentsController($scope, $translatePartialLoader, lsAppConfig) {
    $scope.loadSidebarContent = loadSidebarContent;
    $scope.multipleSelection = true;
    $scope.onShare = onShare;
    $scope.selectedDocuments = [];
    $translatePartialLoader.addPart('filesList');

    ////////////

    /*jshint unused: false */
    function activate(){
      $scope.loadSidebarContent(lsAppConfig.details);
    }

		/**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {string} content - The id of the content to load, see app/views/includes/sidebar-right.html
     * for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData($scope);
      $scope.mainVm.sidebar.setContent(content || lsAppConfig.share);
      $scope.mainVm.sidebar.show();
    }

    function onShare() {
      $scope.loadSidebarContent();
      angular.element('#focusInputShare').focus();
    }
  }
})();
