'use strict';
/**
 * @ngdoc overview
 * @name linshare.document
 * @description
 *
 * # LinshareDocumentService
 * Service of the linshare.document module
 */

angular.module('linshare.document', ['restangular', 'ngTable'])
/**
 * @ngdoc service
 * @name linshare.document.service:LinshareDocumentService
 * @description
 *
 * Service dealing with documents
 */
  .factory('LinshareDocumentService', function(Restangular, $log) {
    var baseRestDocuments = Restangular.all('documents');
    var baseRestShares = Restangular.all('shares');
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
      delete: function(uuid) {
        $log.debug('FileService:deleteFiles');
        return Restangular.one('documents', uuid).remove();
      },
      autocomplete: function(pattern) {
        $log.debug('FileService:autocomplete');
        return Restangular.all('users').one('autocomplete', pattern).get();
      },
      updateFile: function(uuid, documentDto) {
        $log.debug('LinshareDocumentService : updating a document');
        return Restangular.all('documents').post('')
      }
      //editFile,
    };
  })


  //==============================================
  // BOOTSTRAP GROWL
  //==============================================

  .service('growlService', function(){
    var gs = {};
    gs.growl = function(message, type) {
      $.growl({
        message: message
      },{
        type: type,
        allow_dismiss: false,
        label: 'Cancel',
        className: 'btn-xs btn-inverse',
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 2500,
        animate: {
          enter: 'animated bounceIn',
          exit: 'animated bounceOut'
        },
        offset: {
          x: 20,
          y: 85
        }
      });
    }

    return gs;
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
    $scope.selectedDocuments = [];

    $scope.downloadSelectedFiles = function(selectedDocuments) {
      angular.forEach(selectedDocuments, function(doc) {
        $scope.downloadCurrentFile(doc.uuid);
      }
      );
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
              $window.location = url;
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
    $translate(['SWEET_ALERT.ON_FILE_DELETE.TITLE', 'SWEET_ALERT.ON_FILE_DELETE.TEXT',
      'SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON', 'SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON', 'GROWL_ALERT.DELETE']).then(function(translations) {
      $scope.swalTitle = translations['SWEET_ALERT.ON_FILE_DELETE.TITLE'];
      $scope.swalText = translations['SWEET_ALERT.ON_FILE_DELETE.TEXT'];
      $scope.swalConfirm = translations['SWEET_ALERT.ON_FILE_DELETE.CONFIRM_BUTTON'];
      $scope.swalCancel = translations['SWEET_ALERT.ON_FILE_DELETE.CANCEL_BUTTON'];
      $scope.growlMsgDelete = translations['GROWL_ALERT.DELETE'];
    });
    $scope.deleteDocuments = function(document) {
      if(!angular.isArray(document)) {
        document = [document];
      }
      swal({
          title: $scope.swalTitle,
          text: $scope.swalText,
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: $scope.swalConfirm,
          cancelButtonText: $scope.swalCancel,
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm) {
          if (isConfirm) {
            angular.forEach(document, function(doc) {
              $log.debug('value to delete', doc);
              $log.debug('value to delete', documentsList.length);
              LinshareDocumentService.delete(doc.uuid).then(function() {
                removeElementFromCollection(documentsList, doc);
                removeElementFromCollection($scope.selectedDocuments, doc);
                $scope.tableParams.reload();
                growlService.growl($scope.growlMsgDelete, 'inverse');
              });
            });
          }
        }
      );
    };

    $scope.$watch('selectedDocuments', function(n) {
      if(n.length != 1) {
        $log.debug('watcher ******', $scope.mactrl, n);
        $scope.mactrl.sidebarToggle.right = false;
      }
    }, true);

    $scope.$watch('mactrl.sidebarToggle.right', function(n) {
      if(n === true) {
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

    $scope.tableParams = new ngTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20
    }, {
      getData: function($defer, params) {
          var files =  params.sorting() ? $filter('orderBy')(documentsList, params.orderBy()) : documentsList;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });

    $scope.$on('linshare-upload-complete', function() {
      $scope.reload();
    });

    $scope.onShare = function() {
      $('#focusInputShare').focus();
    };
  })
  .directive('eventPropagationStop', function() {
    return {
      link: function(scope, elm) {
        elm.bind('click', function(event) {
          if(elm.parent().parent().parent().parent().hasClass('info')) {
            event.preventDefault();
            event.stopPropagation();
          }
        });
      }
    }
  });
