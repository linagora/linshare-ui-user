'use strict';

angular.module('linshare.share')

  .controller('shareDetailController', function($scope, shareIndex, lsAppConfig){
    var currentShare = $scope.share_array[shareIndex];
    $scope.loadSidebarContent = loadSidebarContent;
    $scope.selectedDocuments = currentShare.documents;
    $scope.shareIndex = Number(shareIndex) + 1;
    $scope.shareToDisplay = currentShare;
  
    ////////////
  
    function activate(){
      $scope.loadSidebarContent(lsAppConfig.activeShareDetails)
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} cotent The id of the content to load, see app/views/includes/sidebar-right.html for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData($scope);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }
  });
