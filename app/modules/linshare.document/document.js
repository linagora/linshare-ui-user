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
  .factory('LinshareDocumentService', function(Restangular, $log) {
    var baseRestDocuments = Restangular.all('documents');
    return {
      getAllFiles: function() {
        $log.debug('FileService:getAllFiles');
        return baseRestDocuments.getList();
      },
      getFileInfo: function(uuid) {
        $log.debug('FileService:getFileInfo');
        return Restangular.one('documents', uuid).get({withShares: true});
      },
      downloadFiles: function(uuid) {
        $log.debug('FileService:downloadFiles');
        return Restangular.all('documents').one(uuid, 'download').get();
      },
      getThumbnail: function(uuid) {
        $log.debug('FileService:getThumbnail');
        return Restangular.one('documents', uuid).one('thumbnail').get({base64: true});
      },
      uploadFiles: function(documentDto) {
        $log.debug('FileService:uploadFiles');
        return Restangular.all('documents').post(documentDto);
      },
      deleteFile: function(uuid) {
        $log.debug('FileService:deleteFiles');
        return Restangular.one('documents', uuid).remove();
      },
      autocomplete: function(pattern) {
        $log.debug('FileService:autocomplete');
        return Restangular.all('users').one('autocomplete', pattern).get();
      },
      updateFile: function(uuid, documentDto) {
        $log.debug('LinshareDocumentService : updating a document');
        return Restangular.all('documents').one(uuid).post(documentDto);
      }
    };
  })

  .controller('DocumentsController', ['$scope', '$translatePartialLoader', 'LinshareDocumentService', '$window',
    function($scope, $translatePartialLoader, LinshareDocumentService, $window) {

      $translatePartialLoader.addPart('filesList');
      $scope.multipleSelection = true;
      $scope.sidebarRightDataType = 'details';

      $scope.downloadFileFromResponse = function(fileName, fileType, fileStream) {
        var blob = new Blob([fileStream], {type: fileType});
        var windowUrl = window.URL || window.webkitURL || window.mozURL || window.msURL;
        var urlObject;

        // https://msdn.microsoft.com/fr-fr/library/hh779016(v=vs.85).aspx
        if(navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, fileName);
        }
        else if(windowUrl) {
          // create tag element a to simulate a download by click
          var link = document.createElement('a');

          // if the attribute download isset in the tag a
          if('download' in link) {
            // Prepare a blob URL
            urlObject = windowUrl.createObjectURL(blob);

            // Set the attribute to the tag element a
            link.setAttribute('href', urlObject);
            link.setAttribute('download', fileName);

            // Simulate clicking the download link
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);
          }
          else {
            // Prepare a blob URL
            // Use application/octet-stream when using window.location to force download
            /* globals  octetStreamMime */
            blob = new Blob([fileStream], {type: octetStreamMime});
            urlObject = windowUrl.createObjectURL(blob);
            $window.location = urlObject;
          }
        }
      };

      $scope.loadSidebarContent = function(content) {
        $scope.sidebarRightDataType = content || 'share';
      };

      $scope.onShare = function() {
        angular.element('#focusInputShare').focus();
        $scope.loadSidebarContent();
      };

  }])

/**
 * @ngdoc controller
 * @name linshare.document.controller:LinshareDocumentController
 * @description
 *
 * The controller to manage documents
 */
  .controller('LinshareDocumentController', function($scope,  $filter, LinshareDocumentService, NgTableParams, $translate,
                                                     $window, $log, documentsList, growlService, $timeout) {
    $scope.selectedDocuments = [];
    $scope.flagsOnSelectedPages = {};

    $scope.loadSidebarContent = function(content) {
      $scope.sidebarRightDataType = content || 'share';
    };
    $scope.onShare = function() {
      angular.element('#focusInputShare').focus();
      $scope.loadSidebarContent();
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

    var removeElementFromCollection = function(collection, element) {
      var index = collection.indexOf(element);
      if(index > -1) {
        collection.splice(index, 1);
      }
    };

    $scope.resetSelectedDocuments = function(){
      angular.forEach($scope.selectedDocuments, function(selectedDoc) {
        selectedDoc.isSelected = false;
      });
      $scope.selectedDocuments = [];
    };

    var swalTitle, swalText, swalConfirm, swalCancel;
    $translate(['SWEET_ALERT.ON_FILE_DELETE.TITLE', 'SWEET_ALERT.ON_FILE_DELETE.TEXT',
      'SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'])
      .then(function(translations) {
        swalTitle = translations['SWEET_ALERT.ON_FILE_DELETE.TITLE'];
        swalText = translations['SWEET_ALERT.ON_FILE_DELETE.TEXT'];
        swalConfirm = translations['SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON'];
        swalCancel = translations['SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'];
      });

    // DELETE ONE OR MANY DOCUMENTS
    $scope.deleteDocuments = function(document) {
      if(!angular.isArray(document)) {
        document = [document];
      }
      swal({
          title: swalTitle,
          text: swalText,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: swalConfirm,
          cancelButtonText: swalCancel,
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm) {
          if(isConfirm) {
            angular.forEach(document, function(doc) {
              $log.debug('value to delete', doc);
              LinshareDocumentService.deleteFile(doc.uuid).then(function() {
                growlService.notifyTopRight('GROWL_ALERT.ACTION.DELETE', 'success');
                removeElementFromCollection($scope.documentsList, doc);
                removeElementFromCollection($scope.selectedDocuments, doc);
                $scope.documentsListCopy = $scope.documentsList; // I keep a copy of the data for the filter module
                $scope.tableParams.reload();
              });
            });
          }
        }
      );
    };

    $scope.downloadCurrentFile = function(currentFile) {
      LinshareDocumentService.downloadFiles(currentFile.uuid)
        .then(function(downloadedFile) {
          $scope.downloadFileFromResponse(currentFile.name, currentFile.type, downloadedFile);
        });
    };

    $scope.downloadSelectedFiles = function(selectedDocuments) {
      angular.forEach(selectedDocuments, function(document) {
        $scope.downloadCurrentFile(document);
      });
    };

    $scope.currentSelectedDocument = {current: ''};

    $scope.showCurrentFile = function(currentFile, event) {
      $scope.currentSelectedDocument.current = currentFile;
      $scope.sidebarRightDataType = 'details';
      if(currentFile.shared > 0) {
        LinshareDocumentService.getFileInfo(currentFile.uuid).then(function(data) {
          $scope.currentSelectedDocument.current.shares = data.shares;
        });
      }
      if(currentFile.hasThumbnail === true) {
        LinshareDocumentService.getThumbnail(currentFile.uuid).then(function(thumbnail) {
          $scope.currentSelectedDocument.current.thumbnail = thumbnail;
        });
      }
      $scope.mactrl.sidebarToggle.right = true;
      var currElm = event.currentTarget;
      angular.element('#fileListTable tr li').removeClass('activeActionButton').promise().done(function() {
        angular.element(currElm).addClass('activeActionButton');
      });
    };

    $scope.$watch('mactrl.sidebarToggle.right', function(n) {
      if(n === true) {
        angular.element('.card').css('width', '70%');
      } else {
        angular.element('.card').css('width', '100%');
      }
    });

    $scope.$on('$stateChangeSuccess', function() {
      if($scope.mactrl.sidebarToggle.right) {
        angular.element('.card').css('width', '70%');
      } else {
        angular.element('.card').css('width', '100%');
      }
    });

    $scope.reloadDocuments = function() {
      LinshareDocumentService.getAllFiles().then(function(data) {
        $scope.documentsList = data;
        $scope.documentsListCopy = data;
        $scope.tableParams.reload();
      });
    };
    $scope.$on('linshare-upload-complete', function() {
      $scope.reloadDocuments();
    });

    $scope.paramFilter = {
      name: ''
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

    var swalCopyInGroup, swalShare, swalDelete, swalDownload, numItems;
    $translate(['ACTION.COPY_IN_GROUP', 'ACTION.SHARE',
      'ACTION.DELETE', 'ACTION.DOWNLOAD', 'SELECTION.NUM_ITEM_SELECTED'])
      .then(function(translations) {
        swalCopyInGroup = translations['ACTION.COPY_IN_GROUP'];
        swalShare = translations['ACTION.SHARE'];
        swalDelete = translations['ACTION.DELETE'];
        swalDownload = translations['ACTION.DOWNLOAD'];
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
          [swalCopyInGroup, function($itemScope, $event, model) {
          }, function() {
            return false;
          }],
          [swalDownload, function($itemScope) {
            window.location.assign($itemScope.linshareBaseUrl + '/documents/' + $itemScope.documentFile.uuid + '/download');

          }, function($itemScope) {
            return $itemScope.selectedDocuments.length < 1;
          }
          ]
        ];
      });
    $scope.closeDetailSidebar = function() {
      angular.element('#fileListTable tr li').removeClass('activeActionButton');
    };
    $scope.sortDropdownSetActive = function($event) {
      var currentStateToggle = $scope.toggleSelectedSort;
      $scope.toggleSelectedSort = !currentStateToggle;
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
    angular.element('md-fab-toolbar').appendTo( '#content-container');
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
  })
/**
 * @ngdoc controller
 * @name linshare.document.controller:LinshareSelectedDocumentsController
 * @description
 *
 * The controller to visualize and manage selected documents
 */
  .controller('LinshareSelectedDocumentsController', function($scope, $stateParams) {
    var param = $stateParams.selected;
    angular.forEach(param, function(n) {
      $scope.selectedDocuments.push(n);
    });

    $scope.sidebarRightDataType = 'share';
    $scope.mactrl.sidebarToggle.right = true;

    $scope.$watch('mactrl.sidebarToggle.right', function(n) {
      if(n === true) {
        angular.element('.card').css('width', '70%');
      } else {
        angular.element('.card').css('width', '100%');
      }
    });

    $scope.removeSelectedDocuments = function(document) {
      var index = $scope.selectedDocuments.indexOf(document);
      if(index > -1) {
        document.isSelected = false;
        $scope.selectedDocuments.splice(index, 1);
      }
    };
  })

  .controller('LinshareUploadViewController', function($scope, $rootScope, growlService) {
    $scope.selectedUploadedFiles = [];

    // once a file has been uploaded we hide the drag and drop background and display the multi-select menu
    /* jshint unused: false */
    $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
      angular.element('.dragNDropCtn').addClass('outOfFocus');
      //pertains to upload-box
      if(angular.element('upload-box') !== null){
        angular.element('.infoPartager').css('opacity','1');
      }
    });

    $scope.removeSelectedDocuments = function(document) {
      var index = $scope.selectedUploadedFiles.indexOf(document);
      if(index > -1) {
        document.isSelected = false;
        $scope.selectedUploadedFiles.splice(index, 1);
      }
    };

    $scope.currentSelectedDocument = {};

    $scope.shareSelectedUpload = function(selectedUpload) {
      if(selectedUpload.length === 0) {
        growlService.notifyTopRight('GROWL_ALERT.WARNING.AT_LEAST_ONE_DOCUMENT', 'warning');
        return;
      }
      $rootScope.$state.go('documents.files.selected', {'selected': selectedUpload});
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
  });
