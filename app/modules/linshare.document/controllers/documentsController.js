(function() {
  'use strict';

  angular
    .module('linshare.document')
    .controller('documentsController', documentsController);

  documentsController.$inject = ['$scope', '$translatePartialLoader'];

  function documentsController($scope, $translatePartialLoader) {
    $translatePartialLoader.addPart('filesList');
    $scope.multipleSelection = true;
    $scope.sidebarRightDataType = 'details';

    //SELECTED FILES AND UPLOADS
    $scope.selectedDocuments = [];

    $scope.loadSidebarContent = function(content) {
      $scope.sidebarRightDataType = content || 'share';
    };

    $scope.onShare = function() {
      $scope.loadSidebarContent();
      angular.element('#focusInputShare').focus();
    };
  }
})();
