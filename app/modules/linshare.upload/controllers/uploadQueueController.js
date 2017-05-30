/**
 * Upload queue controller
 * @namespace UploadQueue
 * @memberOf LinShare.upload
 */
(function() {
  'use strict';
  angular
    .module('linshare.upload')
    .controller('uploadQueueController', uploadQueueController);

  uploadQueueController.$inject = ['_', '$q', '$scope', '$state', '$stateParams', '$timeout', '$translate',
    '$translatePartialLoader', 'authenticationRestService', 'flowUploadService', 'functionalityRestService',
    'lsAppConfig', 'swal', 'toastService'];

  /**
   * @namespace uploadQueueController
   * @desc Controller of all variables and methods for upload queue
   * @memberOf LinShare.upload.uploadQueueController
   */
  function uploadQueueController(_, $q, $scope, $state, $stateParams, $timeout, $translate, $translatePartialLoader,
    authenticationRestService, flowUploadService, functionalityRestService, lsAppConfig, swal, toastService) {
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
    uploadQueueVm.checkSharableFiles = checkSharableFiles;
    uploadQueueVm.clearAllFiles = clearAllFiles;
    uploadQueueVm.clearSelectedFiles = clearSelectedFiles;
    uploadQueueVm.currentPage = 'upload';
    uploadQueueVm.currentSelectedDocument = {};
    uploadQueueVm.flowUploadService = flowUploadService;
    uploadQueueVm.fromWhere = $stateParams.from;
    uploadQueueVm.identifiers = [];
    uploadQueueVm.isflowUploadingError = false;
    uploadQueueVm.isFromMySpace = (uploadQueueVm.fromWhere === $scope.mySpacePage);
    uploadQueueVm.loadSidebarContent = loadSidebarContent;
    uploadQueueVm.lsAppConfig = lsAppConfig;
    uploadQueueVm.pauseAllFiles = pauseAllFiles;
    uploadQueueVm.pauseFile = pauseFile;
    uploadQueueVm.pauseSelectedFiles = pauseSelectedFiles;
    uploadQueueVm.removeSelectedDocuments = removeSelectedDocuments;
    uploadQueueVm.retryAllFiles = retryAllFiles;
    uploadQueueVm.retrySelectedFiles = retrySelectedFiles;
    uploadQueueVm.resumeAllFiles = resumeAllFiles;
    uploadQueueVm.resumeFile = resumeFile;
    uploadQueueVm.resumeSelectedFiles = resumeSelectedFiles;
    uploadQueueVm.retryFile = retryFile;
    uploadQueueVm.selectAll = true;
    uploadQueueVm.selectUploadingDocuments = selectUploadingDocuments;
    uploadQueueVm.selectUploadingFile = selectUploadingFile;
    uploadQueueVm.showBtnList = showBtnList;
    uploadQueueVm.showFileInSource = showFileInSource;
    uploadQueueVm.toggleFilterBySelectedFiles = toggleFilterBySelectedFiles;

    activate();

    ////////////////

    /**
     * @namespace activate
     * @desc Activation function of the controller launch at every instantiation
     * @memberOf LinShare.upload.uploadQueueController
     */
    function activate() {
      uploadQueueVm.fabButton = {
        actions:  [{
          action: null,
          icon: 'zmdi zmdi-plus',
          flowBtn: true,
          hide: !uploadQueueVm.isFromMySpace
        }]
      };

      $translatePartialLoader.addPart('upload');
      $translate.refresh().then(function() {
        $translate([
          'UPLOAD_SHARE_ALERT.CANCEL',
          'UPLOAD_SHARE_ALERT.CONTINUE_AND_EXCLUDE',
          'UPLOAD_SHARE_ALERT.MAIN_DIALOG_BUTTON_TITLE',
          'UPLOAD_SHARE_ALERT.MESSAGE',
          'UPLOAD_SHARE_ALERT.MESSAGE_PLURAL',
          'UPLOAD_SHARE_ALERT.MESSAGE_SINGULAR',
          'UPLOAD_SHARE_ALERT.TITLE_PLURAL',
          'UPLOAD_SHARE_ALERT.TITLE_SINGULAR'
        ]).then(function(translations) {
          uploadQueueVm.warningCancel = translations['UPLOAD_SHARE_ALERT.CANCEL'];
          uploadQueueVm.warningContinueMainButton = translations['UPLOAD_SHARE_ALERT.MAIN_DIALOG_BUTTON_TITLE'];
          uploadQueueVm.warningMessage = translations['UPLOAD_SHARE_ALERT.MESSAGE'];
          uploadQueueVm.warningMessagePlural = translations['UPLOAD_SHARE_ALERT.MESSAGE_PLURAL'];
          uploadQueueVm.warningMessageSingular = translations['UPLOAD_SHARE_ALERT.MESSAGE_SINGULAR'];
          uploadQueueVm.warningTitlePlural = translations['UPLOAD_SHARE_ALERT.TITLE_PLURAL'];
          uploadQueueVm.warningTitleSingular = translations['UPLOAD_SHARE_ALERT.TITLE_SINGULAR'];
        });
      });

      _.forEach(uploadQueueVm.$flow.files, function(file) {
        file.isSelected = false;
        file.hideOnIsolate = false;
      });

      if (idUpload) {
        var fileToHighlight = uploadQueueVm.$flow.getFromUniqueIdentifier(idUpload);
        if (fileToHighlight._from === uploadQueueVm.fromWhere) {
          uploadQueueVm.selectUploadingFile(fileToHighlight, true);
          $timeout(function() {
            window.scrollTo(0, angular.element('div.media-body[data-uid-flow="' + idUpload + '"]').first().offset().top);
          }, 250);
        }
      }

      $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
        // TODO : choose myspace or workgroup (if workgroup, open a dialog where I can browse folders)
        flowFile._from = $scope.mySpacePage;
        uploadQueueVm.selectUploadingFile(flowFile, true);
      });

      $scope.$on('flow::fileError', function fileErrorAction() {
        uploadQueueVm.isflowUploadingError = true;
      });

      uploadQueueVm.location = {
        mySpace: false,
        workgroup: false
      };
      $q.all([authenticationRestService.getCurrentUser(), functionalityRestService.getAll()])
        .then(function(promises) {
          var
            user = promises[0],
            functionalities = promises[1];
          uploadQueueVm.location.mySpace = user.canUpload;
          uploadQueueVm.location.workgroup = functionalities.WORK_GROUP.enable;
      });
    }

    /**
     * @namespace alertUnsharableFilesSelectedSwal
     * @desc Show alert dialog if error files in selected files list when user confirm share action
     * @param {number} nbErrorFilesSelected - Number of error files in selected files list
     * @param {Function} executeShare - Execute share action
     * @param {Object} shareType - Type of share
     * @memberOf LinShare.upload.uploadQueueController
     */
    function alertUnsharableFilesSelectedSwal(nbErrorFilesSelected, executeShare, shareType) {
      var message, title;
      if (nbErrorFilesSelected === 1) {
        title = uploadQueueVm.warningTitleSingular;
        message = uploadQueueVm.warningMessageSingular;
      } else {
        title = _.clone(uploadQueueVm.warningTitlePlural).replace('${nbErrorFilesSelected}', nbErrorFilesSelected);
        message = uploadQueueVm.warningMessagePlural;
      }

      swal({
          html: true,
          title: title,
          text: message,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3fa9ff',
          confirmButtonText: uploadQueueVm.warningContinueMainButton,
          cancelButtonText: uploadQueueVm.warningCancel,
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm) {
          if (isConfirm) {
            continueShareAction(executeShare, shareType);
          }
        }
      );
    }

    /**
     * @namespace cancelAllFiles
     * @desc Cancel all uploading files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function cancelAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && (!file.isComplete() || file.error)) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @namespace cancelSelectedFiles
     * @desc Cancel selected uploading files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function cancelSelectedFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && (!file.isComplete() || file.error)) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @namespace checkSharableFiles
     * @desc Check list of selected files, if files with error are present
     * @param {Function} executeShare - Execute share action
     * @param {Object} shareType - Type of share
     * @memberOf LinShare.upload.uploadQueueController
     */
    function checkSharableFiles(executeShare, shareType) {
      uploadQueueVm.nbErrorFilesSelected = 0;
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && file.error) {
          uploadQueueVm.nbErrorFilesSelected++;
        }
      });

      if (uploadQueueVm.nbErrorFilesSelected === lengthOfSelectedDocuments()) {
        var messageKey = lengthOfSelectedDocuments() > 1 ?
          'NO_SHAREABLE_FILE_SELECTED_PLURAL' : 'NO_SHAREABLE_FILE_SELECTED_SINGULAR';
        $translate('UPLOAD_SHARE_ALERT.' + messageKey).then(function(message) {
          toastService.error(message);
        });
      } else if (uploadQueueVm.nbErrorFilesSelected > 0) {
        alertUnsharableFilesSelectedSwal(uploadQueueVm.nbErrorFilesSelected, executeShare, shareType);
      } else {
        continueShareAction(executeShare, shareType);
      }
    }

    /**
     * @namespace clearAllFiles
     * @desc Clear all uploading files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function clearAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && file.isComplete() && !file.error) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @namespace clearSelectedFiles
     * @desc Clear selected uploading files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function clearSelectedFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && file.isComplete() && !file.error) {
          uploadQueueVm.removeSelectedDocuments(file);
        }
      });
    }

    /**
     * @name continueShareAction
     * @desc Remove files error selected files and launch share flow (open sidebar to fill form, or execute share)
     * @param {Function} executeShare - Execute share action
     * @param {Object} shareType - Type of share
     */
    function continueShareAction(executeShare, shareType) {
      removeUnsharableFiles().then(function() {
        if (executeShare) {
          executeShare(shareType, uploadQueueVm.selectedDocuments, uploadQueueVm.selectedUploads);
        } else {
          $scope.onShare();
          uploadQueueVm.loadSidebarContent(uploadQueueVm.lsAppConfig.share);
        }
      });
    }

    /**
     * @namespace lengthOfSelectedDocuments
     * @desc Return the length or the array of selected uploads
     * @returns {number} Number of selected files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function lengthOfSelectedDocuments() {
      return Object.keys($scope.selectedUploads).length;
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {string} content - The name of the content to load,
     *                 see app/views/includes/sidebar-right.html for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(uploadQueueVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    /**
     * @namespace pauseAllFiles
     * @desc Pause all uploading files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function pauseAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && !file.paused) {
          uploadQueueVm.pauseFile(file);
        }
      });
      uploadQueueVm.$flow.isPaused = true;
    }

    /**
     * @namespace pauseFile
     * @desc Pause current file
     * @param {Object} flowFile - File uploading to be paused
     * @memberOf LinShare.upload.uploadQueueController
     */
    function pauseFile(flowFile) {
      flowFile.pause();
      flowFile.quotaChecked = false;
    }

    /**
     * @namespace pauseSelectedFiles
     * @desc Pause selected uploading files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function pauseSelectedFiles() {
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && !file.paused) {
          uploadQueueVm.pauseFile(file);
        }
      });
    }

    /**
     * @namespace removeSelectedDocuments
     * @desc Remove selected uploading files
     * @param {Object} flowFile - File uploading to be removed
     * @memberOf LinShare.upload.uploadQueueController
     */
    function removeSelectedDocuments(flowFile) {
      delete $scope.selectedUploads[flowFile.uniqueIdentifier];
      flowFile.cancel();
    }

    /**
     * @namespace removeUnsharableFiles
     * @desc Pop all unsharable files from selected files list
     * @returns {promise} Promise to continues others functions
     * @memberOf LinShare.upload.uploadQueueController
     */
    function removeUnsharableFiles() {
      var deferred = $q.defer();
      if (uploadQueueVm.nbErrorFilesSelected > 0) {
        _.forEach(uploadQueueVm.$flow.files, function(file) {
          if (file.isSelected && file.error) {
            file.isSelected = false;
            delete $scope.selectedUploads[file.uniqueIdentifier];
          }
        });
      }
      deferred.resolve();
      return deferred.promise;
    }

    /**
     * @namespace resetSelectedDocuments
     * @desc Clear the array of selected uploads
     * @memberOf LinShare.upload.uploadQueueController
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
     * @namespace resumeAllFiles
     * @desc Resume all uploading files
     * @memberOf LinShare.upload.uploadQueueController
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
     * @namespace resumeFile
     * @desc Resume current file
     * @param {Object} flowFile - File uploading to be resume
     * @memberOf LinShare.upload.uploadQueueController
     */
    function resumeFile(flowFile) {
      flowFile.resume();
      uploadQueueVm.flowUploadService.checkQuotas([flowFile], false, $scope.setUserQuotas);
    }

    /**
     * @namespace resumeSelectedFiles
     * @desc Resume selected uploading files
     * @memberOf LinShare.upload.uploadQueueController
     */
    function resumeSelectedFiles() {
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && file.paused) {
          file.resume();
        }
      });
    }

    /**
     * @namespace retryAllFiles
     * @desc Retry all files which get error
     * @memberOf LinShare.upload.uploadQueueController
     */
    function retryAllFiles() {
      _.forInRight(uploadQueueVm.$flow.files, function(file) {
        if ((file._from === uploadQueueVm.fromWhere) && file.error) {
          uploadQueueVm.retryFile(file);
        }
      });
      uploadQueueVm.isflowUploadingError = false;
    }

    /**
     * @namespace retryFile
     * @desc Retry current file
     * @param {Object} flowFile - File uploading to be resume
     * @memberOf LinShare.upload.uploadQueueController
     */
    function retryFile(flowFile) {
      if (flowFile.canBeRetried) {
        flowFile.errorAgain = false;
        uploadQueueVm.flowUploadService.checkQuotas([flowFile], true, $scope.setUserQuotas);
      }
    }

    /**
     * @namespace retrySelectedFiles
     * @desc Retry selected files which get error
     * @memberOf LinShare.upload.uploadQueueController
     */
    function retrySelectedFiles() {
      _.forEach(uploadQueueVm.$flow.files, function(file) {
        if (file.isSelected && file.error) {
          uploadQueueVm.retryFile(file);
        }
      });
      uploadQueueVm.isflowUploadingError = false;
    }

    /**
     * @namespace selectUploadingDocuments
     * @desc Add the selected element in the selected documents list
     * @param {Array<Object>} flowFiles - Array of files to browse
     * @param {boolean} selectFilesAutomatically - check if the selection is manual or automatic
     * @memberOf LinShare.upload.uploadQueueController
     */
    function selectUploadingDocuments(flowFiles, selectFilesAutomatically) {
      var files = flowFiles || uploadQueueVm.$flow.files;
      var forceSelect = selectFilesAutomatically ? true : uploadQueueVm.selectAll;
      _.forEach(files, function(file) {
        if (file._from === uploadQueueVm.fromWhere) {
          uploadQueueVm.selectUploadingFile(file, forceSelect);
        }
      });

      if (!selectFilesAutomatically) {
        uploadQueueVm.selectAll = !uploadQueueVm.selectAll;
      }
    }

    /**
     * @namespace selectUploadingFile
     * @desc Set specifics values to flowFile in queue
     * @param {Object} file - File uploaded
     * @param {boolean} selectFile - Select file or not
     * @memberOf LinShare.upload.uploadQueueController
     */
    function selectUploadingFile(file, selectFile) {
      file.isSelected = selectFile;
      if (file.isSelected) {
        $scope.selectedUploads[file.uniqueIdentifier] = {
          name: file.name,
          size: file.size,
          type: file.getType(),
          uniqueIdentifier: file.uniqueIdentifier
        };
      } else {
        delete $scope.selectedUploads[file.uniqueIdentifier];
      }
    }

    /**
     * @namespace showBtnList
     * @desc // TODO : [TOFILL]
     * @param {Object} $event - event handle
     * @memberOf LinShare.upload.uploadQueueController
     */
    // TODO : Directive for the button in $event
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
     * @memberOf LinShare.upload.uploadQueueController
     */
    function showFileInSource(file) {
      if (!_.isUndefined(file.folderDetails)) {
        file.folderDetails.uploadedFileUuid = file.linshareDocument.uuid;
        if(_.isNil(file.folderDetails.folderUuid)) {
          $state.go('sharedspace.workgroups.root', file.folderDetails);
        } else {
          $state.go('sharedspace.workgroups.folder', file.folderDetails);
        }
      } else {
        $state.go('documents.files', {
          uploadedFileUuid: file.linshareDocument.uuid
        });
      }
    }

    /**
     * @namespace toggleFilterBySelectedFiles
     * @desc isolates files in table or show all
     * @memberOf LinShare.upload.uploadQueueController
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
