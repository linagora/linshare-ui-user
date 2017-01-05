'use strict';

angular.module('linshare.share')
  .controller('LinshareShareActionController', function($scope, LinshareShareService, $log, $stateParams, growlService,
                                                        $translate, ShareObjectService, documentUtilsService) {
    var shareActionVm = this;
    shareActionVm.closeSideBar = closeSideBar;
    shareActionVm.filesToShare = $stateParams.selected;
    shareActionVm.newShare = new ShareObjectService();
    shareActionVm.selectedContact = {};
    shareActionVm.submitShare = submitShare;

    ////////////////

    function closeSideBar() {
      shareActionVm.newShare.resetForm();
      $scope.mainVm.sidebar.hide();
    }

    function submitShare(shareCreationDto, selectedDocuments, selectedUploads) {
      if (selectedDocuments.length === 0 && (selectedUploads === undefined || (Object.keys(selectedUploads).length === 0))) {
        growlService.notifyBottomRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'danger');
        return;
      }
      if (shareCreationDto.getRecipients().length === 0) {
        growlService.notifyBottomRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT', 'danger');
        return;
      }

      selectedUploads = selectedUploads || {};
      var currentUploads = selectedUploads;
      for (var upload in currentUploads) {
        if (currentUploads.hasOwnProperty(upload)) {
          var flowFile = $scope.$flow.getFromUniqueIdentifier(upload);
          flowFile.isSelected = false;
          if (flowFile.isComplete()) {
            shareActionVm.newShare.addDocuments(flowFile.linshareDocument);
            delete currentUploads[upload];
          } else {
            if (_.isUndefined($scope.refFlowShares[upload])) {
              $scope.refFlowShares[upload] = {
                shareArrayIndex: []
              };
            }
            $scope.refFlowShares[upload].shareArrayIndex.push([$scope.share_array.length]);
            shareActionVm.newShare.addwaitingUploadIdentifiers(upload);
          }
        }
      }

      shareActionVm.newShare.addDocuments(selectedDocuments);
      shareActionVm.newShare.share().then(function() {
        $scope.$emit('linshare-share-done');
        documentUtilsService.reloadDocumentsList = true;
        $scope.mainVm.sidebar.hide();
        $scope.share_array.push(angular.copy(shareActionVm.newShare.getObjectCopy()));
        shareActionVm.newShare.resetForm();
        $scope.mainVm.sidebar.getData().resetSelectedDocuments();
        for (var upload in currentUploads) {
          if (currentUploads.hasOwnProperty(upload)) {
            delete $scope.selectedUploads[upload];
          }
        }
      }, function(data) {
        if (data.statusText === 'asyncMode') {
          $log.debug('share processing with files in upload progress', data);
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE_ASYNC', 'inverse');
          $scope.mainVm.sidebar.hide();
          var shareCopy = _.cloneDeep(shareActionVm.newShare.getObjectCopy());
          for (var upload in currentUploads) {
            if (currentUploads.hasOwnProperty(upload)) {
              shareCopy.documents.push(currentUploads[upload]);
              // TODO: check if sidebar changed if it still works
              delete $scope.mainVm.sidebar.getData().selectedUploads[upload];
            }
          }

          $scope.share_array.push(shareCopy);
          shareActionVm.newShare.resetForm();
        } else {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE_FAILED', 'danger');
        }
      });
    }
  });
