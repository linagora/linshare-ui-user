(function() {
  'use strict';

  angular
    .module('linshare.document')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('filesList');
    }])
    .controller('documentsController', documentsController);

  documentsController.$inject = ['$scope', 'lsAppConfig'];

  function documentsController($scope, lsAppConfig) {
    $scope.loadSidebarContent = loadSidebarContent;
    $scope.multipleSelection = true;
    $scope.onShare = onShare;
    $scope.selectedDocuments = [];

    ////////////

    /* eslint-disable */
    function activate(){
      $scope.loadSidebarContent(lsAppConfig.details);
    }
    /* eslint-enable */

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
