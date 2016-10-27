(function() {
  'use strict';
  angular
    .module('linshare.upload')
    .controller('uploadQueueController', uploadQueueController);

  function uploadQueueController($scope, $rootScope, growlService, $timeout, $state, $stateParams, flowParamsService, flowUploadService, sharableDocumentService) {
    // TODO : vm instead of $scope

    flowParamsService.setFlowParams('', '');
    var idUpload = $stateParams.idUpload;
    $scope.fromWhere = $stateParams.from;
    $scope.isFromMySpace = ($scope.fromWhere === $scope.mySpacePage);
    $scope.flowUploadService = flowUploadService;
    $scope.isflowUploadingError = false;
    $scope.selectAll = true;
    $scope.showBtnList = showBtnList;
    $scope.identifiers = [];
    $scope.currentSelectedDocument = {};
    $scope.mainVm.sidebar.hide(); 
    $scope.selectedUploads = {};
    $scope.resumeSelectedFiles = resumeSelectedFiles;
    $scope.pauseSelectedFiles = pauseSelectedFiles;
    $scope.retrySelectedFiles = retrySelectedFiles;
    $scope.cancelSelectedFiles = cancelSelectedFiles;
    $scope.clearSelectedFiles = clearSelectedFiles;
    $scope.resumeAllFiles = resumeAllFiles;
    $scope.pauseAllFiles = pauseAllFiles;
    $scope.retryAllFiles = retryAllFiles;
    $scope.cancelAllFiles = cancelAllFiles;
    $scope.clearAllFiles = clearAllFiles;
    $scope.removeSelectedDocuments = removeSelectedDocuments;
    $scope.addUploadedFile = addUploadedFile;
    $scope.showFileInSource = showFileInSource;
    $scope.isFlowInProgress = isFlowInProgress;
    $scope.shareSelectedUpload = shareSelectedUpload;
    $scope.selectUploadingDocuments = selectUploadingDocuments;
    $scope.resetSelectedDocuments = resetSelectedDocuments;
    $scope.lengthOfSelectedDocuments = lengthOfSelectedDocuments;

    $scope.$flow.files.forEach(function(n) {
      if (n.isSelected) {
        n.isSelected = false;
      }
    });

    activate();

    function activate() {
      if (idUpload) {
        var currentElemFlow;
        currentElemFlow = $scope.$flow.getFromUniqueIdentifier(idUpload);
        currentElemFlow.isSelected = true;
        $scope.selectedUploads[currentElemFlow.uniqueIdentifier] = {
          name: currentElemFlow.name,
          size: currentElemFlow.size,
          type: currentElemFlow.getType()
        };
        $timeout(function() {
          window.scrollTo(0, angular.element('div.media-body[data-uid-flow="' + idUpload + '"]').first().offset().top);
        }, 250);
      }
    }

    // once a file has been uploaded we hide the drag and drop background and display the multi-select menu
    /* jshint unused: false */
    $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
      _.assign($flow.defaults.query, flowParamsService.getFlowParams());
      flowFile._from = $scope.mySpacePage; // I GIVE THIS FILE TO MYSPACE FOR THE MOMENT
      flowFile.isSelected = true;
      $scope.selectedUploads[flowFile.uniqueIdentifier] = {
        name: flowFile.name,
        size: flowFile.size,
        type: flowFile.getType(),
        flowId: flowFile.uniqueIdentifier
      };
      angular.element('.drag-and-drop-ctn').addClass('out-of-focus');
      //pertains to upload-box
      if (angular.element('upload-box') !== null) {
        angular.element('.info-share').css('opacity', '1');
      }
    });


    // MANAGE FLOW STATES

    $scope.$on('flow::fileError', function (event, $flow, flowFile) {
      console.log('ERROR', flowFile);
      $scope.isflowUploadingError = true;
    });


    function isFlowInProgress(flowObj) {
      return flowObj.progress() > 0 && flowObj.progress() < 1;
    }

    // MANAGE FLOW SELECTED ELEMENTS
    function resumeSelectedFiles() {
      _.forEach($scope.$flow.files, function(file) {
        if (file.isSelected && file.paused) {
          file.resume();
        }
      });
    }

    function pauseSelectedFiles() {
      _.forEach($scope.$flow.files, function(file) {
        if (file.isSelected && !file.paused) {
          file.pause();
        }
      });
    }

    function retrySelectedFiles() {
      _.forEach($scope.$flow.files, function(file) {
        if (file.isSelected && file.error) {
          file.retry();
        }
      });
    }

    function cancelSelectedFiles() {
      for(var i = $scope.$flow.files.length - 1; i >= 0; i--) {
        if ($scope.$flow.files[i].isSelected && !$scope.$flow.files[i].isComplete()) {
          $scope.removeSelectedDocuments($scope.$flow.files[i]);
        }
      }
    }

    function clearSelectedFiles() {
      for(var i = $scope.$flow.files.length - 1; i >= 0; i--) {
        if ($scope.$flow.files[i].isSelected && $scope.$flow.files[i].isComplete()) {
          $scope.removeSelectedDocuments($scope.$flow.files[i]);
        }
      }
    }

    // MANAGE FLOW ALL ELEMENTS
    function resumeAllFiles() {
      for(var i = $scope.$flow.files.length - 1; i >= 0; i--) {
        if (($scope.$flow.files[i]._from === $scope.fromWhere) && $scope.$flow.files[i].paused) {
          $scope.$flow.files[i].resume();
        }
      }
      $scope.$flow.isPaused = false;
    }

    function pauseAllFiles() {
      for(var i = $scope.$flow.files.length - 1; i >= 0; i--) {
        if (($scope.$flow.files[i]._from === $scope.fromWhere) && !$scope.$flow.files[i].paused) {
          $scope.$flow.files[i].pause();
        }
      }
      $scope.$flow.isPaused = true;
    }

    function retryAllFiles() {
      for(var i = $scope.$flow.files.length - 1; i >= 0; i--) {
        if (($scope.$flow.files[i]._from === $scope.fromWhere) && $scope.$flow.files[i].error) {
          $scope.$flow.files[i].retry();
        }
      }
      $scope.isflowUploadingError = false;
    }

    function cancelAllFiles() {
      for(var i = $scope.$flow.files.length - 1; i >= 0; i--) {
        if (($scope.$flow.files[i]._from === $scope.fromWhere) && !$scope.$flow.files[i].isComplete()) {
          $scope.removeSelectedDocuments($scope.$flow.files[i]);
        }
      }
    }

    function clearAllFiles() {
      for(var i = $scope.$flow.files.length - 1; i >= 0; i--) {
        if (($scope.$flow.files[i]._from === $scope.fromWhere) && $scope.$flow.files[i].isComplete()) {
          $scope.removeSelectedDocuments($scope.$flow.files[i]);
        }
      }
    }

    function removeSelectedDocuments(flowFile) {
      delete $scope.selectedUploads[flowFile.uniqueIdentifier];
      flowFile.cancel();
    }

    function lengthOfSelectedDocuments() {
      return Object.keys($scope.selectedUploads).length;
    }

    function addUploadedFile(flowFile, serverResponse) {
      var uploadedDocument = flowUploadService.addUploadedFile(flowFile, serverResponse);
      if ($scope.isFromMySpace) {
        sharableDocumentService.sharableDocuments(uploadedDocument, $scope.share_array, $scope.refFlowShares);
      }
    }

    function showFileInSource(file) {
      console.log(file, file.folderInfos);
      if (!_.isUndefined(file.folderInfos)) {
        file.folderInfos.uploadedFileUuid = file.linshareDocument.uuid;
        $state.go('sharedspace.workgroups.entries', file.folderInfos);
      } else {
        $state.go('documents.files', {uploadedFileUuid: file.linshareDocument.uuid});
      }
    }

    function shareSelectedUpload(selectedUpload) {
      if (Object.keys(selectedUpload).length === 0) {
        growlService.notifyTopRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'warning');
        return;
      }
      $rootScope.$state.go('documents.files.selected', {'selected': selectedUpload});
    }

    function selectUploadingDocuments() {
      _.forEach($scope.$flow.files, function(flowFile) {
        flowFile.isSelected = $scope.selectAll;
        if (flowFile.isSelected) {
          $scope.selectedUploads[flowFile.uniqueIdentifier] = {
            name: flowFile.name,
            size: flowFile.size,
            type: flowFile.getType()
          };
        } else {
          delete $scope.selectedUploads[flowFile.uniqueIdentifier];
        }
      });
      $scope.selectAll = !$scope.selectAll;
    }

    function resetSelectedDocuments() {
      _.forEach($scope.selectedUploads, function(value, key) {
        var a = $scope.$flow.getFromUniqueIdentifier(key);
        a.isSelected = false;
        delete $scope.selectedUploads[key];
      });
      $scope.selectAll = true;
    }

    $scope.currentPage = 'upload';
    $scope.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };

    $scope.$watch('fab.isOpen', function(isOpen) {
      if (isOpen) {
        angular.element('.md-toolbar-tools').addClass('setWhite');
        angular.element('.multi-select-mobile').addClass('setDisabled');
        $timeout(function() {
          angular.element('#overlayMobileFab').addClass('toggledMobileShowOverlay');
          angular.element('#content-container').addClass('setDisabled');
        }, 250);
      } else {
        angular.element('.md-toolbar-tools').removeClass('setWhite');
        $timeout(function() {
          angular.element('.multi-select-mobile').removeClass('setDisabled');
          angular.element('#overlayMobileFab').removeClass('toggledMobileShowOverlay');
          angular.element('#content-container').removeClass('setDisabled');
        }, 250);
      }
    });

    function showBtnList($event) {
      var showBtnListElem = $event.currentTarget;
      if (angular.element(showBtnListElem).hasClass('activeShowMore')) {
        angular.element(showBtnListElem).parent().prev().find('div').first()
          .removeClass('data-list-slide-toggle activeShowMore').css('display:none !important;');
      } else {
        angular.element(showBtnListElem).addClass('activeShowMore').parent().prev().find('div')
          .first().addClass('data-list-slide-toggle');
      }
    }
  }
})();
