/**
 * @author Alpha O. Sall
 */
'use strict';

angular.module('linshare.document')

/**
 * @ngdoc controller
 * @name linshare.document.controller:LinshareSelectedDocumentsController
 * @description
 *
 * The controller to visualize and manage selected documents
 */
  .controller('LinshareUploadViewController', function($scope, $rootScope, growlService, $timeout, $stateParams) {
    $scope.mactrl.sidebarToggle.right = false;
    $scope.selectedUploads = {};
    $scope.lengthOfSelectedDocuments = function() {
      return Object.keys($scope.selectedUploads).length;
    };
    $scope.$flow.files.forEach(function(n) {
      if(n.isSelected) {
        n.isSelected = false;
      }
    });

    var idUpload=$stateParams.idUpload;
    if(idUpload){
      $scope.currentElemFlow = $scope.$flow.getFromUniqueIdentifier(idUpload);
      $scope.currentElemFlow.isSelected = true;
      $scope.selectedUploads[$scope.currentElemFlow.uniqueIdentifier] = {
        name: $scope.currentElemFlow.name,
        size: $scope.currentElemFlow.size,
        type: $scope.currentElemFlow.getType()
      };
      $timeout(function() {
        window.scrollTo(0, angular.element('div.media-body[data-uid-flow="'+idUpload+'"]').first().offset().top);
      }, 250);
    }
    // once a file has been uploaded we hide the drag and drop background and display the multi-select menu
    /* jshint unused: false */
    $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
      flowFile.isSelected = true;
      $scope.selectedUploads[flowFile.uniqueIdentifier] = {
        name: flowFile.name,
        size: flowFile.size,
        type: flowFile.getType(),
        flowId: flowFile.uniqueIdentifier
      };
      angular.element('.dragNDropCtn').addClass('outOfFocus');
      //pertains to upload-box
      if(angular.element('upload-box') !== null) {
        angular.element('.infoPartager').css('opacity','1');
      }
    });

    $scope.identifiers = [];
    $scope.$on('flow::filesSubmitted', function(event, $flow, flowFile) {
    });

    //FLOW JS
    $scope.pauseFlow = function(flowObj) {
      flowObj.pause();
      flowObj.isPaused = true;
    };
    $scope.resumeFlow = function(flowObj) {
      flowObj.resume();
      flowObj.isPaused = false;
    };
    $scope.cleanFlowQueue = function(flowObj) {
      for(var i = flowObj.files.length - 1; i >= 0; i--) {
        if(flowObj.files[i].isComplete()) {
          $scope.removeSelectedDocuments(flowObj.files[i]);
        }
      }
    };
    $scope.isFlowInprogress = function(flowObj) {
      return flowObj.progress() > 0 && flowObj.progress() < 1;
    };

    $scope.removeSelectedDocuments = function(flowFile) {
      delete $scope.selectedUploads[flowFile.uniqueIdentifier];
      flowFile.cancel();
    };


    $scope.currentSelectedDocument = {};
    $scope.shareSelectedUpload = function(selectedUpload) {
      if(Object.keys(selectedUpload).length === 0) {
        growlService.notifyTopRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'warning');
        return;
      }
      $rootScope.$state.go('documents.files.selected', {'selected': selectedUpload});
    };
    $scope.selectAll = true;

    $scope.selectUploadingDocuments = function() {
      angular.forEach($scope.$flow.files, function(flowFile) {
        flowFile.isSelected = $scope.selectAll;
        if(flowFile.isSelected) {
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
    };

    $scope.resetSelectedDocuments = function() {
      angular.forEach($scope.selectedUploads, function(value, key) {
        var a = $scope.$flow.getFromUniqueIdentifier(key);
        a.isSelected = false;
        delete $scope.selectedUploads[key];
      });
      $scope.selectAll = true;
    };
    $scope.currentPage='upload';
    $scope.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };

    $scope.$watch('fab.isOpen', function(isOpen) {
      if(isOpen) {
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

    $scope.showBtnList = function($event) {
      var showBtnListElem = $event.currentTarget;
      if (angular.element(showBtnListElem).hasClass('activeShowMore')) {
        angular.element(showBtnListElem).parent().prev().find('div').first()
          .removeClass('dataListSlideToggle activeShowMore').css('display:none !important;');
      } else {
        angular.element(showBtnListElem).addClass('activeShowMore').parent().prev().find('div')
          .first().addClass('dataListSlideToggle');
      }
    };
  });
