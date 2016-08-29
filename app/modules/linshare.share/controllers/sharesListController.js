'use strict';

angular.module('linshare.share')

  .controller('shareDetailController', function($scope, shareIndex) {
    var currentShare = $scope.share_array[shareIndex];
    $scope.shareToDisplay = currentShare;
    $scope.selectedDocuments = currentShare.documents;
    $scope.shareIndex = shareIndex;
    $scope.sidebarRightDataType = 'active-share-details';
    $scope.mactrl.sidebarToggle.right = true;
  });
