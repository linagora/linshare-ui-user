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


/**
 * @ngdoc controller
 * @name linshare.document.controller:LinshareDocumentController
 * @description
 *
 * The controller to manage documents
 */
  .controller('LinshareDocumentController', function($scope,  $filter, LinshareDocumentService, ngTableParams, $translate,
                                                     $window, $log, documentsList, growlService, $translatePartialLoader) {
    $translatePartialLoader.addPart('filesList');
    $scope.selectedDocuments = [];//basket

    $scope.resetSelectedDocuments = function() {
      angular.forEach($scope.selectedDocuments, function(selectedDoc) {
        selectedDoc.isSelected = false;
      });
      $scope.selectedDocuments = [];
    };

    $scope.flagsOnSelectedPages = {};

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
    $scope.indexSelectedDocuments = [];

    $scope.downloadSelectedFiles = function(selectedDocuments) {
      angular.forEach(selectedDocuments, function(doc) {
        $scope.downloadCurrentFile(doc.uuid);
      });
    };

    $scope.downloadCurrentFile = function(currentFile) {
      LinshareDocumentService.downloadFiles(currentFile.uuid)
        .then(function(downloadedFile) {
          var fileType = currentFile.type;
          var blob = new Blob([downloadedFile], {type: fileType});
          var windowUrl = window.URL || window.webkitURL || window.mozURL || window.msURL;
          var urlObject;

          // https://msdn.microsoft.com/fr-fr/library/hh779016(v=vs.85).aspx
          if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, currentFile.name);
          }
          else if (windowUrl) {
            // create tag element a to simulate a download by click
            var link = document.createElement('a');

            // if the attribute download isset in the tag a
            if ('download' in link) {
              // Prepare a blob URL
              urlObject = windowUrl.createObjectURL(blob);

              // Set the attribute to the tag element a
              link.setAttribute('href', urlObject);
              link.setAttribute('download', currentFile.name);

              // Simulate clicking the download link
              var event = document.createEvent('MouseEvents');
              event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
              link.dispatchEvent(event);
            }
            else {
              // Prepare a blob URL
              // Use application/octet-stream when using window.location to force download
              blob = new Blob([downloadedFile], {type: octetStreamMime});
              urlObject = windowUrl.createObjectURL(blob);
              $window.location = urlObject;
            }
          }
        });
    };

    $scope.editProperties = function(restangObject) {
      restangObject.save();
    };

    var removeElementFromCollection = function(collection, element) {
      var index = collection.indexOf(element);
      if (index > -1) {
        collection.splice(index, 1);
      }
    };

    var swalTitle, swalText, swalConfirm, swalCancel, growlMsgDelete;
    $translate(['SWEET_ALERT.ON_FILE_DELETE.TITLE', 'SWEET_ALERT.ON_FILE_DELETE.TEXT',
      'SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON',
      'GROWL_ALERT.DELETE']).then(function(translations) {
      swalTitle = translations['SWEET_ALERT.ON_FILE_DELETE.TITLE'];
      swalText = translations['SWEET_ALERT.ON_FILE_DELETE.TEXT'];
      swalConfirm = translations['SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON'];
      swalCancel = translations['SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'];
      growlMsgDelete = translations['GROWL_ALERT.DELETE'];
    });

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
          if (isConfirm) {
            angular.forEach(document, function(doc) {
              $log.debug('value to delete', doc);
              $log.debug('value to delete', documentsList.length);
              LinshareDocumentService.deleteFile(doc.uuid).then(function() {
                growlService.notifyTopRight(growlMsgDelete, 'success');
                removeElementFromCollection(documentsList, doc);
                removeElementFromCollection($scope.selectedDocuments, doc);
                $scope.tableParams.reload();
              });
            });
          }
        }
      );
    };

    $scope.multipleSelection = true;
    $scope.currentSelectedDocument = {current: 'test'};
    $scope.sidebarData = 'details';

    $scope.showCurrentFile = function(currentFile) {
      $scope.currentSelectedDocument.current = currentFile;
      $scope.sidebarData = 'details';
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
    };

    $scope.$watch('multipleSelection', function(n) {
      if(n === false) {
        $scope.selectedDocuments = [];
        angular.element('tr').removeClass('highlightListElem');
      }
    });

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

    $scope.users = [];
    $scope.reload = function() {
      LinshareDocumentService.getAllFiles().then(function(data) {
        documentsList = data;
        $scope.tableParams.total(documentsList.length);
        $scope.tableParams.reload();
      });
    };
    $scope.paramFilter = {
      name: ''
    };

    $scope.documentsList2 = documentsList;
    $scope.documentsList = documentsList;

    $scope.tableParams = new ngTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20,
      filter: $scope.paramFilter
    }, {
      total: $scope.documentsList.length,
      getData: function($defer, params) {
        var filteredData = params.filter() ?
          $filter('filter')($scope.documentsList, params.filter()) : $scope.documentsList;
          var files =  params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });

    $scope.$on('linshare-upload-complete', function() {
      $scope.reload();
    });

    $scope.loadSidebarContent = function(content) {
      $scope.sidebarData = content || 'share';
    };

    $scope.onShare = function() {
      $('#focusInputShare').focus();
      $scope.loadSidebarContent();
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
    var param = $stateParams.selected;
    angular.forEach(param, function(n) {
      $scope.selectedDocuments.push(n);
    });

    $scope.loadSidebarContent = function(content) {
      $scope.sidebarData = content || 'share';
    };
    $scope.sidebarData = 'share';
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

  .controller('LinshareUploadViewController', function($scope) {
    $scope.selectedUploadedFiles = [];

    // once a file has been uploaded we hide the drag and drop background and display the multi-select menu
    $scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
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

  })

  .directive('eventPropagationStop', function() {
    return {
      link: function(scope, elm, attrs) {
        elm.bind('click', function(event) {
          var hasInfoClass = elm.parent().parent().parent().parent().hasClass('highlightListElem');
          if (!attrs.eventPropagationStop || hasInfoClass) {
            event.preventDefault();
            event.stopPropagation();
          }
        });
      }
    };
  });
