'use strict';

angular.module('linshare.share')
  .controller('LinshareShareActionController', function(_, $scope, LinshareShareService, $log, $translate,
    ShareObjectService, toastService, documentUtilsService) {
    var shareActionVm = this;

    shareActionVm.closeSideBar = closeSideBar;
    shareActionVm.uploadPage = 'upload';
    shareActionVm.newShare = new ShareObjectService();
    shareActionVm.selectedContact = {};
    shareActionVm.submitShare = submitShare;
    shareActionVm.onAfterShare = onAfterShare;

    ////////////////

    function closeSideBar() {
      shareActionVm.newShare.resetForm();
      $scope.mainVm.sidebar.hide();
    }

    function handleErrors(shareCreationDto, selectedDocuments, selectedUploads) {
      if (selectedDocuments.length === 0 &&
        (selectedUploads === undefined || (Object.keys(selectedUploads).length === 0))) {
        toastService.error({key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT'});

        return true;
      }
      if (shareCreationDto.getRecipients().length === 0 && shareCreationDto.getMailingListUuid().length === 0) {
        toastService.error({key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT'});

        return true;
      }

      if (!shareActionVm.newShare.checkValidNotificationDateForUSDA()) {
        toastService.error({ key: 'RIGHT_PANEL.SHARE_OPTIONS.NOTIFICATION_DATE_INVALID'});

        return true;
      }
    }

    function submitShare(shareCreationDto, selectedDocuments, selectedUploads, form) {
      if (handleErrors(shareCreationDto, selectedDocuments, selectedUploads) || (form && !form.$valid)) {
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
            $scope.refFlowShares[upload].shareArrayIndex.push([$scope.shareArray.length]);
            shareActionVm.newShare.addwaitingUploadIdentifiers(upload);
          }
        }
      }

      shareActionVm.newShare.addDocuments(selectedDocuments);
      shareActionVm.newShare.share().then(function() {
        onAfterShare();
        for (var upload in currentUploads) {
          if (currentUploads.hasOwnProperty(upload)) {
            delete $scope.selectedUploads[upload];
          }
        }
      }, function(data) {
        if (data.statusText) {
          $log.debug('SHARE ASYNC -', data);
          toastService.info({key: 'TOAST_ALERT.ACTION.SHARE_ASYNC'});
          $scope.mainVm.sidebar.hide();
          var shareCopy = _.cloneDeep(shareActionVm.newShare.getObjectCopy());

          for (var upload in currentUploads) {
            if (currentUploads.hasOwnProperty(upload)) {
              shareCopy.documents.push(currentUploads[upload]);
              // TODO: check if sidebar changed if it still works
              delete $scope.mainVm.sidebar.getData().selectedUploads[upload];
            }
          }

          $scope.shareArray.push(shareCopy);
          shareActionVm.newShare.resetForm();
        } else {
          toastService.error({key: 'TOAST_ALERT.ACTION.SHARE_FAILED'});
        }
      });
    }

    function onAfterShare() {
      $scope.$emit('linshare-share-done');
      documentUtilsService.setReloadDocumentsList(true);
      $scope.mainVm.sidebar.hide();
      $scope.shareArray.push(angular.copy(shareActionVm.newShare.getObjectCopy()));
      shareActionVm.newShare.resetForm();
      $scope.mainVm.sidebar.getData().resetSelectedDocuments();
    }
  });
