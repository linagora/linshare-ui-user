/**
 * @author Alpha Sall
 */

'use strict';

angular.module('linshare.share')

  .controller('LinshareShareActionController', function($scope, LinshareShareService, $log, $stateParams, growlService,
                                                        $translate, ShareObjectService) {

    $scope.newShare = new ShareObjectService();

    $scope.selectedContact = {};

    $scope.closeSideBar = function() {
      $scope.newShare.resetForm();
      $scope.mactrl.sidebarToggle.right = false;
    };

    $scope.submitShare = function(shareCreationDto, selectedDocuments, selectedUploads) {
      if($scope.selectedDocuments.length === 0 && Object.keys(selectedUploads).length === 0) {
        growlService.notifyBottomRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'danger');
        return;
      }
      if(shareCreationDto.getRecipients().length === 0) {
        growlService.notifyBottomRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT', 'danger');
        return;
      }

      selectedUploads = selectedUploads || {};
      var currentUploads = selectedUploads;
      for(var upload in currentUploads) {
        if(currentUploads.hasOwnProperty(upload)) {
          var flowFile = $scope.$flow.getFromUniqueIdentifier(upload);
          flowFile.isSelected = false;
          if(flowFile.isComplete()) {
            $scope.newShare.addDocuments(flowFile.linshareDocument);
            delete currentUploads[upload];
          } else {
            $scope.refFlowShares[upload] = [$scope.share_array.length];
            $scope.newShare.addwaitingUploadIdentifiers(upload);
          }
        }
      }

      $scope.newShare.addDocuments($scope.selectedDocuments);
      $scope.newShare.share().then(function() {
        $scope.$emit('linshare-upload-complete');
        $scope.mactrl.sidebarToggle.right = false;
        $scope.share_array.push(angular.copy($scope.newShare.getObjectCopy()));
        $scope.newShare.resetForm();
        $scope.resetSelectedDocuments();
        for(var upload in currentUploads) {
          if(currentUploads.hasOwnProperty(upload)) {
            delete $scope.selectedUploads[upload];
          }
        }
      }, function(data) {
        if(data.statusText === 'asyncMode') {
          $log.debug('share processing with files in upload progress', data);
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE_ASYNC', 'inverse');
          $scope.mactrl.sidebarToggle.right = false;
          var shareCopy = angular.copy($scope.newShare.getObjectCopy());
          for(var upload in currentUploads) {
            if(currentUploads.hasOwnProperty(upload)) {
              shareCopy.documents.push(currentUploads[upload]);
              delete $scope.selectedUploads[upload];
            }
          }

          $scope.share_array.push(shareCopy);
          $scope.newShare.resetForm();
        } else {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE_FAILED', 'danger');
        }
      });
    };
    $scope.submitQuickShare = function(shareCreationDto) {
      angular.forEach($scope.selectedDocuments, function(doc) {
        shareCreationDto.documents.push(doc.uuid);
      });
      if($scope.selectedContact.length > 0) {
        shareCreationDto.recipients.push({mail: $scope.selectedContact});
      }
      LinshareShareService.shareDocuments(shareCreationDto).then(function() {
        growlService.notifyTopRight($scope.growlMsgShareSuccess, 'inverse');
        $scope.$emit('linshare-upload-complete');
        $scope.mactrl.sidebarToggle.right = false;
        angular.element('tr').removeClass('highlightListElem');
        $scope.resetSelectedDocuments();
      });
    };

    $scope.filesToShare = $stateParams.selected;
  });
