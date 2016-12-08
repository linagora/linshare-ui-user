/**
 * Upload queue controller
 * @namespace UploadQueue
 * @memberOf LinShare
 */
(function() {
  'use strict';
  angular
    .module('linshare.upload')
    .controller('uploadQueueController', uploadQueueController);

  /**
   * @namespace uploadQueueController
   * @desc controller of all variables and methods for upload queue
   * @memberOf LinShare.UploadQueue.uploadQueueController
   */
  function uploadQueueController($rootScope, $scope, $state, $stateParams, $timeout, flowParamsService,
    flowUploadService, growlService, lsAppConfig) {
    /* jshint validthis:true */
    var uploadQueueVm = this;
    var idUpload = $stateParams.idUpload;

    $scope.lengthOfSelectedDocuments = lengthOfSelectedDocuments;
    $scope.resetSelectedDocuments = resetSelectedDocuments;
    $scope.selectedUploads = {};

    // TODO: refactor in services, no mix with declarations below
    uploadQueueVm.lengthOfSelectedDocuments = $scope.lengthOfSelectedDocuments;
    uploadQueueVm.resetSelectedDocuments = $scope.resetSelectedDocuments;
    uploadQueueVm.selectedDocuments = $scope.selectedDocuments;
    uploadQueueVm.selectedUploads = $scope.selectedUploads;

    uploadQueueVm.$flow = $scope.$flow;
    uploadQueueVm.cancelAllFiles = cancelAllFiles;
    uploadQueueVm.cancelSelectedFiles = cancelSelectedFiles;
    uploadQueueVm.clearAllFiles = clearAllFiles;
    uploadQueueVm.clearSelectedFiles = clearSelectedFiles;
    uploadQueueVm.currentPage = 'upload';
    uploadQueueVm.currentSelectedDocument = {};
    uploadQueueVm.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };
    uploadQueueVm.flowUploadService = flowUploadService;
    uploadQueueVm.fromWhere = $stateParams.from;
    uploadQueueVm.identifiers = [];
    uploadQueueVm.isflowUploadingError = false;
    uploadQueueVm.isFromMySpace = (uploadQueueVm.fromWhere === $scope.mySpacePage);
    uploadQueueVm.loadSidebarContent = loadSidebarContent;
    uploadQueueVm.lsAppConfig = lsAppConfig;
    uploadQueueVm.pauseAllFiles = pauseAllFiles;
    uploadQueueVm.pauseSelectedFiles = pauseSelectedFiles;
    uploadQueueVm.removeSelectedDocuments = removeSelectedDocuments;
    uploadQueueVm.retryAllFiles = retryAllFiles;
    uploadQueueVm.retrySelectedFiles = retrySelectedFiles;
    uploadQueueVm.resumeAllFiles = resumeAllFiles;
    uploadQueueVm.resumeSelectedFiles = resumeSelectedFiles;
    uploadQueueVm.selectAll = true;
    uploadQueueVm.selectUploadingDocuments = selectUploadingDocuments;
    uploadQueueVm.showBtnList = showBtnList;
    uploadQueueVm.showFileInSource = showFileInSource;
    uploadQueueVm.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;

    activate();

    ////////////////

    /**
     * @namespace activate
     * @desc activation function of the controller launch at every instanciation
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function activate() {
      $scope.mainVm.sidebar.hide();

      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected) {
          file.isSelected = false;
        }
        file.hideOnIsolate = false;
      });

      if (idUpload) {
        var currentElemFlow;
        currentElemFlow = uploadQueueVm.$flow.getFromUniqueIdentifier(idUpload);
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

      flowParamsService.setFlowParams('', '');

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

      $scope.$on('flow::fileError', function() {
        uploadQueueVm.isflowUploadingError = true;
      });

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
    }

    /**
     * @namespace cancelAllFiles
     * @desc cancel all uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function cancelAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && !file.isComplete()) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @namespace cancelSelectedFiles
     * @desc cancel selected uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function cancelSelectedFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && !file.isComplete()) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @namespace clearAllFiles
     * @desc clear all uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function clearAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && file.isComplete()) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @namespace clearSelectedFiles
     * @desc clear selected uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function clearSelectedFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && file.isComplete()) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @namespace lengthOfSelectedDocuments
     * @desc return the length or the array of selected uploads
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function lengthOfSelectedDocuments() {
      return Object.keys($scope.selectedUploads).length;
    }

    /**
     * @name loadSidebarContent
     * @desc update the content of the sidebar
     * @param {String} content The id of the content to load,
     *                 see app/views/includes/sidebar-right.html for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(uploadQueueVm);
      $scope.mainVm.sidebar.setContent(content ||  lsAppConfig.share);
      $scope.mainVm.sidebar.show();
    }

    /**
     * @namespace pauseAllFiles
     * @desc pause all uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function pauseAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && !file.paused) {
          file.pause();
        }
      });
      uploadQueueVm.$flow.isPaused = true;
    }

    /**
     * @namespace pauseSelectedFiles
     * @desc pause selected uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function pauseSelectedFiles() {
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && !file.paused) {
          file.pause();
        }
      });
    }

    /**
     * @namespace resetSelectedDocuments
     * @desc clear the array of selected uploads
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function resetSelectedDocuments() {
      _.forEach($scope.selectedUploads, function(value, key) {
        var fileSelected = uploadQueueVm.$flow.getFromUniqueIdentifier(key);
        fileSelected.isSelected = false;
        delete $scope.selectedUploads[key];
      });
      uploadQueueVm.selectAll = true;
    }

    /**
     * @namespace removeSelectedDocuments
     * @desc Remove selected uploading files
     * @param {Object} flowFile - File uploadig to be removed
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function removeSelectedDocuments(flowFile) {
      delete $scope.selectedUploads[flowFile.uniqueIdentifier];
      flowFile.cancel();
    }

    /**
     * @namespace retryAllFiles
     * @desc retry all files which get error
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function retryAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && file.error) {
          file.retry();
        }
      });
      uploadQueueVm.isflowUploadingError = false;
    }

    /**
     * @namespace retrySelectedFiles
     * @desc retry selected files which get error
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function retrySelectedFiles() {
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && file.error) {
          file.retry();
        }
      });
    }

    /**
     * @namespace resumeAllFiles
     * @desc resume all uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function resumeAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && file.paused) {
          file.resume();
        }
      });
      uploadQueueVm.$flow.isPaused = false;
    }

    /**
     * @namespace resumeSelectedFiles
     * @desc resume selected uploading files
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function resumeSelectedFiles() {
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && file.paused) {
          file.resume();
        }
      });
    }

    /**
     * @namespace selectUploadingDocuments
     * @desc add the selected element in the selected documents list
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function selectUploadingDocuments() {
      _.forEach(uploadQueueVm.$flow.files, function(flowFile) {
        flowFile.isSelected = uploadQueueVm.selectAll;
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
      uploadQueueVm.selectAll = !uploadQueueVm.selectAll;
    }

    /**
     * @namespace showBtnList
     * @desc
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function showBtnList($event) {
      var showBtnListElem = $event.currentTarget;
      if (angular.element(showBtnListElem).hasClass('activeShowMore')) {
        angular.element(showBtnListElem).parent().prev().find('div').first()
          .removeClass('data-list-slide-toggle');
        angular.element(showBtnListElem).removeClass('activeShowMore');
      } else {
        angular.element(showBtnListElem).addClass('activeShowMore').parent().prev().find('div')
          .first().addClass('data-list-slide-toggle');
      }
    }

    /**
     * @namespace showFileInSource
     * @desc open the source (workgroup folder or personnal space and select the clicked element)
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function showFileInSource(file) {
      if (!_.isUndefined(file.folderInfos)) {
        file.folderInfos.uploadedFileUuid = file.linshareDocument.uuid;
        $state.go('sharedspace.workgroups.entries', file.folderInfos);
      } else {
        $state.go('documents.files', {
          uploadedFileUuid: file.linshareDocument.uuid
        });
      }
    }

    /**
     * @namespace toggleFilterBySelectedFiles
     * @desc isolates files in table or show all
     * @memberOf LinShare.UploadQueue.uploadQueueController
     */
    function toggleFilterBySelectedFiles() {
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.hideOnIsolate) {
          file.hideOnIsolate = false;
        } else if (!file.isSelected) {
          file.hideOnIsolate = true;
        }
      });
    }
  }
})();
