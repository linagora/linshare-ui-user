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
        return Restangular.one('documents', uuid).get();
      },
      downloadFiles: function(uuid) {
        $log.debug('FileService:downloadFiles');
        return Restangular.all('documents').one(uuid, 'download').get();
      },
      getThumbnail: function(uuid) {
        $log.debug('FileService:getThumbnail');
        return Restangular.one('documents', uuid).one('thumbnail').get();
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
  .controller('LinshareDocumentController', function($scope,  $filter, LinshareDocumentService, ngTableParams, $window, $log, documentsList, growlService) {

    $scope.selectedDocuments = [];

    $scope.download = function(selectedDocuments) {
      angular.forEach(selectedDocuments, function(document){
        LinshareDocumentService.downloadFiles(document.uuid);
        //.then(function(file) {
        //  console.log(file);
        //  var blob = new Blob([file], {type: 'text/plain'});
        //  $scope.url = window.URL.createObjectURL(blob);
        //  console.log('url', $scope.url);
        //  // $window.open(url);
        //  //return file;
        //});
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

    $scope.deleteSelected = function() {
      swal({
          title: "Are you sure?",
          text: "You are about to remove " + $scope.selectedDocuments.length + " file(s) !",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "cancel!",
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm) {
          if (isConfirm) {
            angular.forEach($scope.selectedDocuments, function(document) {
              $log.debug('value to delete', document);
              $log.debug('value to delete', documentsList.length);
              LinshareDocumentService.delete(document.uuid).then(function() {
                removeElementFromCollection(documentsList, document);
                removeElementFromCollection($scope.selectedDocuments, document);
                $scope.tableParams.reload();
                growlService.growl('suppression réussie', 'inverse');
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

    $scope.reload = function() {
      $scope.tableParams.reload();
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
  });
