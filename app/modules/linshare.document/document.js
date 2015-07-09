'use strict';
/**
 * @ngdoc overview
 * @name linshare.document
 * @description
 *
 * # LinshareDocumentService
 * Service of the linshare.document module
 */

angular.module('linshare.document', ['restangular'])
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
      getAllFiles: function(){
        $log.debug('FileService:getAllFiles');
        return baseRestDocuments.getList();
      },
      getFileInfo: function(uuid) {
        $log.debug('FileService:getFileInfo');
        return Restangular.one('documents', uuid).get();
      },
      downloadFiles: function(uuid){
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
/**
 * @ngdoc controller
 * @name linshare.document.controller:LinshareDocumentController
 * @description
 *
 * The controller to manage documents
 */
  .controller('LinshareDocumentController', function($scope,  $filter, LinshareDocumentService, ngTableParams, $window, $log) {
    //$scope.user = user;
    $scope.download = function() {
      angular.forEach($scope.SelectedElement, function(uuid){
        LinshareDocumentService.downloadFiles(uuid).then(function(file) {
          console.log(file);
          var blob = new Blob([file], {type: 'text/plain'});
          $scope.url = window.URL.createObjectURL(blob);
          console.log('url', $scope.url);
          // $window.open(url);
          //return file;
        });

      });
    };
    $scope.editProperties = function(restangObject) {
      restangObject.save();
    };
    $scope.SelectedElement = [];
    $scope.allFiles = LinshareDocumentService.getAllFiles();
    $scope.delete = function() {
      angular.forEach($scope.SelectedElement, function(uuid){
        $log.debug('value to delete', uuid);
        LinshareDocumentService.delete(uuid).then(function(){
          $scope.tableParams.reload();

          //$scope.SelectedElement = [];
        });
      });
    };
    $scope.documentDetails = {};

    //NEVER EVER : TO REMOVE ASAP
    $scope.close = function() {
      document.getElementsByTagName('section')[3].style.className = 'col-md-12';
      document.getElementsByTagName('section')[4].style.display = 'none';

    };

    $scope.tableParams = new ngTableParams({
      page: 1,
      sorting: {creationDate: 'desc'},
      count: 20
    }, {
      getData: function($defer, params) {
        $scope.allFiles.then(function(files) {
          files = params.sorting() ? $filter('orderBy')(files, params.orderBy()) : files;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        });
      }

    });

  });
