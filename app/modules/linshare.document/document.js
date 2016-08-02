/**
 * @author Alpha O. Sall
 */

'use strict';
/**
 * @ngdoc overview
 * @name linshare.document
 * @description
 *
 * # LinshareDocumentService
 * Service of the linshare.document module
 */

angular.module('linshare.document', ['restangular', 'ngTable', 'linshare.components'])
/**
 * @ngdoc service
 * @name linshare.document.service:LinshareDocumentService
 * @description
 *
 * Service dealing with documents
 */
  .factory('LinshareDocumentRestService', function(Restangular, $log) {
    var baseRestDocuments = Restangular.all('documents');
    return {
      getAllFiles: function() {
        $log.debug('LinshareDocumentRestService:getAllFiles');
        return baseRestDocuments.getList();
      },
      get: function(uuid) {
        $log.debug('LinshareDocumentRestService:get a File details');
        return Restangular.one('documents', uuid).get({withShares: true});
      },
      downloadFile: function(uuid) {
        $log.debug('LinshareDocumentRestService:downloadFiles');
        return Restangular.all('documents').one(uuid, 'download').withHttpConfig({responseType: 'arraybuffer'}).get();
      },
      getThumbnail: function(uuid) {
        $log.debug('LinshareDocumentRestService:getThumbnail');
        return Restangular.one('documents', uuid).one('thumbnail').get({base64: true});
      },
      uploadFiles: function(documentDto) {
        $log.debug('LinshareDocumentRestService:uploadFiles');
        return Restangular.all('documents').post(documentDto);
      },
      deleteFile: function(uuid) {
        $log.debug('LinshareDocumentRestService:deleteFiles');
        return Restangular.one('documents', uuid).remove();
      },
      autocomplete: function(pattern) {
        $log.debug('LinshareDocumentRestService:autocomplete');
        return Restangular.all('users').one('autocomplete', pattern).get();
      },
      updateFile: function(uuid, documentDto) {
        $log.debug('LinshareDocumentRestService : updating a document');
        return Restangular.all('documents').one(uuid).post(documentDto);
      }
    };
  })

  .controller('DocumentsController', ['$scope', '$translatePartialLoader',
    function($scope, $translatePartialLoader) {

      $translatePartialLoader.addPart('filesList');
      $scope.multipleSelection = true;
      $scope.sidebarRightDataType = 'details';

      //SELECTED FILES AND UPLOADS
      $scope.selectedDocuments = [];
      $scope.selectedUploads = {};

      $scope.loadSidebarContent = function(content) {
        $scope.sidebarRightDataType = content || 'share';
      };

      $scope.onShare = function() {
        $scope.loadSidebarContent();
        angular.element('#focusInputShare').focus();
       };
  }])

/**
 * @ngdoc controller
 * @name linshare.document.controller:LinshareDocumentController
 * @description
 *
 * The controller to manage documents
 */
  .controller('LinshareDocumentController', function($scope, $filter, LinshareDocumentRestService, NgTableParams, $translate,
                                                     $window, $log, documentsList, growlService, $timeout, documentUtilsService) {
    $scope.mactrl.sidebarToggle.right = false;
    $scope.selectedDocuments = [];
    $scope.flagsOnSelectedPages = {};

    $scope.loadSidebarContent = function(content) {
      $scope.sidebarRightDataType = content || 'share';
    };
    $scope.onShare = function() {
      $scope.loadSidebarContent();
      $timeout(function() {
          angular.element('#focusInputShare').trigger('focus');
      }, 350);
    };
    $scope.lengthOfSelectedDocuments = function() {
      return $scope.selectedDocuments.length;
    };

    $scope.selectDocumentsOnCurrentPage = function(data, page, selectFlag) {
      var currentPage = page || $scope.tableParams.page();
      var dataOnPage = data || $scope.tableParams.data;
      var select = selectFlag || $scope.flagsOnSelectedPages[currentPage];
      if(!select) {
        angular.forEach(dataOnPage, function(element) {
          if(!element.isSelected) {
            element.isSelected = true;
            $scope.selectedDocuments.push(element);
          }
        });
        $scope.flagsOnSelectedPages[currentPage] = true;
      } else {
        $scope.selectedDocuments = _.xor($scope.selectedDocuments, dataOnPage);
        angular.forEach(dataOnPage, function(element) {
          if(element.isSelected) {
            element.isSelected = false;
            _.remove($scope.selectedDocuments, function(n) {
              return n.uuid === element.uuid;
            });
          }
        });
        $scope.flagsOnSelectedPages[currentPage] = false;
      }
    };

    $scope.currentDocument = {};

    $scope.resetSelectedDocuments = function() {
      delete $scope.tableParams.filter().isSelected;
      angular.forEach($scope.selectedDocuments, function(selectedDoc) {
        selectedDoc.isSelected = false;
      });
      $scope.selectedDocuments = [];
    };

    $scope.downloadCurrentFile = function(currentFile) {
      LinshareDocumentRestService.downloadFile(currentFile.uuid)
        .then(function(fileStream) {
          documentUtilsService.downloadFileFromResponse(fileStream, currentFile.name, currentFile.type);
        });
    };

    $scope.downloadSelectedFiles = function(selectedDocuments) {
      angular.forEach(selectedDocuments, function(document) {
        $scope.downloadCurrentFile(document);
      });
    };

    $scope.getDocumentThumbnail = function(uuid) {
      LinshareDocumentRestService.getThumbnail(uuid).then(function(thumbnail) {
        $scope.currentSelectedDocument.current.thumbnail = thumbnail;
      });
    };

    $scope.getDocumentInfo = function(uuid) {
      LinshareDocumentRestService.get(uuid).then(function(data) {
        $scope.currentSelectedDocument.current.shares = data.shares;
      });
    };

    $scope.backToSidebarContentDetails = function() {
      if($scope.sidebarRightDataType === 'share-details') {
        $scope.loadSidebarContent('details');
      }
    };

    $scope.currentSelectedDocument = {current: ''};
    $scope.recipientShareDetails = {current: ''};

    $scope.showCurrentFile = function(currentFile, event) {
      $scope.currentSelectedDocument.current = currentFile;
      $scope.sidebarRightDataType = 'details';
      LinshareDocumentRestService.get(currentFile.uuid).then(function(data) {
        $scope.currentSelectedDocument.current = data;
      });
      if(currentFile.hasThumbnail) {
        LinshareDocumentRestService.getThumbnail(currentFile.uuid).then(function(thumbnail) {
          $scope.currentSelectedDocument.current.thumbnail = thumbnail;
        });
      }
      $scope.mactrl.sidebarToggle.right = true;
      var currElm = event.currentTarget;
      angular.element('#fileListTable tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
      });
    };

    $scope.getDetails = function(item) {
      return documentUtilsService.getItemDetails(LinshareDocumentRestService, item);
    };

    $scope.reloadDocuments = function() {
        $timeout(function () {
          LinshareDocumentRestService.getAllFiles().then(function (data) {
          $scope.documentsList = data;
          $scope.documentsListCopy = data;
          $scope.isNewAddition = true;
          $scope.tableParams.reload();
            $timeout(function () {
              $scope.isNewAddition = false;
            }, 0);
        }, 500);


      });
    };


    $scope.paramFilter = {
      name: ''
    };
    $scope.toggleFilterBySelectedFiles = function() {
      if($scope.tableParams.filter().isSelected) {
        delete $scope.tableParams.filter().isSelected;
      } else {
        $scope.tableParams.filter().isSelected = true;
      }
    };
    $scope.documentsListCopy = documentsList;
    $scope.documentsList = documentsList;

    $scope.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 10,
      filter: $scope.paramFilter
    }, {
      total: $scope.documentsList.length,
      getData: function($defer, params) {
        var filteredData = params.filter() ?
          $filter('filter')($scope.documentsList, params.filter()) : $scope.documentsList;
        var files = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }

    });
    $scope.deleteDocuments = documentUtilsService.deleteDocuments
      .bind(this, $scope.documentsList, $scope.selectedDocuments, $scope.tableParams);
    $scope.$on('linshare-upload-complete', function() {
      $scope.reloadDocuments();
    });

    var swalCopyInGroup, swalShare, swalDelete, swalDownload, numItems, swalInformation;
    $translate(['ACTION.COPY_TO', 'ACTION.SHARE', 'ACTION.INFORMATION',
      'ACTION.DELETE', 'ACTION.DOWNLOAD', 'SELECTION.NUM_ITEM_SELECTED'])
      .then(function(translations) {
        swalCopyInGroup = translations['ACTION.COPY_TO'];
        swalShare = translations['ACTION.SHARE'];
        swalDelete = translations['ACTION.DELETE'];
        swalDownload = translations['ACTION.DOWNLOAD'];
        swalInformation = translations['ACTION.INFORMATION'];
        numItems = translations['SELECTION.NUM_ITEM_SELECTED'];
        /* jshint unused: false */
        $scope.moreOptionsContexualMenu = [
          [function($itemScope, $event) {
            return $itemScope.selectedDocuments.length + ' ' + numItems;
          }],
          [swalShare, function($itemScope) {
            $scope.onShare();
            $scope.mactrl.sidebarToggle.right = true;
          }],
          [swalDelete, function($itemScope) {
            $scope.deleteDocuments($itemScope.selectedDocuments);
          }],
          [swalInformation, function($itemScope) {
            $scope.showCurrentFile($itemScope.documentFile);
          }, function($itemScope) {
            return $itemScope.selectedDocuments.length === 1;
          }],
          [swalCopyInGroup, function($itemScope, $event, model) {
          }, function() {
            return false;
          }],
          [swalDownload, function($itemScope) {
            var landingUrl = $itemScope.linshareBaseUrl + '/documents/' + $itemScope.documentFile.uuid + '/download';
            $window.location.href = landingUrl;
          }, function($itemScope) {
            return $itemScope.selectedDocuments.length === 1;
          }]
        ];
      });
    $scope.closeDetailSidebar = function() {
      angular.element('#fileListTable tr li').removeClass('activeActionButton');
    };
    $scope.sortDropdownSetActive = function(sortField, $event) {
      $scope.toggleSelectedSort = !$scope.toggleSelectedSort;
      $scope.tableParams.sorting(sortField, $scope.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sortDropdown a ').removeClass('selectedSorting').promise().done(function() {
        angular.element(currTarget).addClass('selectedSorting');
      });
    };

    $scope.toggleSearchState=function(){
      if(!$scope.searchMobileDropdown){
        $scope.openSearch();
      }else{
        $scope.closeSearch();
      }
      $scope.searchMobileDropdown = !$scope.searchMobileDropdown;
    };
    $scope.openSearch = function(){
      angular.element('#dropArea').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    };

    $scope.closeSearch = function(){
      angular.element('#dropArea').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    };
    $scope.$on('$stateChangeSuccess', function() {
      angular.element('.multi-select-mobile').appendTo('body');
    });

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
    $scope.currentPage='my_files';
    $scope.toggleSelectedSort = true;

    $scope.data = {
      selectedIndex: 0,
      bottom:        false
    };
    $scope.nextTab = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
    };
    $scope.previousTab = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };

    $scope.slideTextarea = function($event){
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().addClass('show-full-comment');
    };
    $scope.slideUpTextarea = function($event){
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().removeClass('show-full-comment');
    };
    $scope.setTextInput = function ($event) {
      var currTarget = $event.currentTarget;
      var inputTxt = angular.element(currTarget).text();
      if (inputTxt === '') {
        angular.element(currTarget).parent().find('span').css('display', 'block');
      } else {
        angular.element(currTarget).parent().find('span').css('display', 'none');
      }
    };
    $scope.lsFormat = function() {
      return $translate.use() === 'fr-FR' ? 'd MMMM y' : 'MMMM d y';
    };
    $scope.lsFullDateFormat = function() {
      return $translate.use() === 'fr-FR' ? 'Le d MMMM y à  h:mm a' : 'The MMMM d  y at h:mma';
    };
    $scope.addSelectedDocument = addSelectedDocument();
    function addSelectedDocument() {
      return documentUtilsService.selectDocument.bind(undefined, $scope.selectedDocuments);
    }


    var  swalMultipleDownloadTitle , swalMultipleDownloadText ,
      swalMultipleDownloadConfirm;
    $translate(['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
      'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
      'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'])
      .then(function(translations) {
        swalMultipleDownloadTitle= translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
        swalMultipleDownloadText= translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT'];
        swalMultipleDownloadConfirm= translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
      });

    $scope.unavailableMultiDownload = function() {
      swal({
          title: swalMultipleDownloadTitle,
          text: swalMultipleDownloadText,
          type: 'error',
          confirmButtonColor: '#05b1ff',
          confirmButtonText: swalMultipleDownloadConfirm,
          closeOnConfirm: true
        }
      );
    };
  })
/**
 * @ngdoc controller
 * @name linshare.document.controller:LinshareSelectedDocumentsController
 * @description
 *
 * The controller to visualize and manage selected documents
 */
  .controller('LinshareSelectedDocumentsController', function($scope, $stateParams) {
    $scope.selectedFlowIdentifiers = $stateParams.selected;

    $scope.lengthOfSelectedDocuments = function() {
      return $scope.selectedDocuments.length + Object.keys($scope.selectedUploads).length;
    };
    $scope.mactrl.sidebarToggle.right = true;

    $scope.$parent.sidebarRightDataType = 'share';
    $scope.currentPage = '';
    var param = $stateParams.selected;
    angular.forEach(param, function(n) {
      $scope.selectedDocuments.push(n);
    });
    $scope.sidebarRightDataType = 'active-share-details';
    $scope.removeSelectedDocuments = function(document) {
      var index = $scope.selectedDocuments.indexOf(document);
      if(index > -1) {
        document.isSelected = false;
        $scope.selectedDocuments.splice(index, 1);
      }
    };
    /* For the mobile user flow : the sidebar  is hidden at first ( when the page loads up )*/
    function resetMobileState(){
      $scope.mactrl.sidebarToggle.right = false;
      angular.element('#collapsible-content').removeClass('setWidth');
    }

    var isMobile = angular.element('html').hasClass('ismobile');
    if (isMobile) {
      resetMobileState();
    }
    angular.element(window).resize(function() {
      resetMobileState();
    });

  })

  .controller('LinshareUploadViewController', function($scope, $rootScope, growlService, $timeout) {
    $scope.mactrl.sidebarToggle.right = false;
    $scope.lengthOfSelectedDocuments = function() {
      return Object.keys($scope.selectedUploads).length;
    };

    // once a file has been uploaded we hide the drag and drop background and display the multi-select menu
    /* jshint unused: false */
    $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
      flowFile.isSelected = true;
      $scope.selectedUploads[flowFile.uniqueIdentifier] = {
        name: flowFile.name,
        size: flowFile.size,
        type: flowFile.getType()
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

    $scope.removeSelectedDocuments = function(document) {
      var index = $scope.selectedUploads.indexOf(document);
      if(index > -1) {
        document.isSelected = false;
        $scope.selectedUploads.splice(index, 1);
      }
    };

    $scope.currentSelectedDocument = {};
    $scope.shareSelectedUpload = function(selectedUpload) {
      if(Object.keys(selectedUpload).length === 0) {
        growlService.notifyTopRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'warning');
        return;
      }
      $rootScope.$state.go('documents.files.selected', {'selected': selectedUpload});
    };
    $scope.selectAll = false;

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
  })

  .directive('eventPropagationStop', function() {
    return {
      link: function(scope, elm, attrs) {
        elm.bind('click', function(event) {
          var hasInfoClass = elm.parent().parent().parent().parent().hasClass('highlightListElem');
          if(!attrs.eventPropagationStop || hasInfoClass) {
            event.stopPropagation();
          }
        });
      }
    };
  })
  .directive('newUploadAnim', function() {
  return function(scope, element) {
    if (scope.isNewAddition) {
      if (scope.$first) {
        angular.element(element).addClass('set-hidden-anim').delay(200).queue(function(){
          $(this).addClass('anim-in');
        });
        scope.isNewAddition = false;
      }else{
        scope.isNewAddition = false;
      }
    }
  };
});
