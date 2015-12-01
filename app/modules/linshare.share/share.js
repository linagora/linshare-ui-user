'use strict';

/**
 * @ngdoc overview
 * @name linshare.share
 * @description
 *
 * This module has two services written
 * to make all http calls about sharing file.
 */
angular.module('linshare.share', ['restangular', 'ui.bootstrap'])

/**
 * @ngdoc service
 * @name linshare.share.service:LinshareShareService
 * @description
 *
 * Service to get and post all information about files shared by the user
 */
  .factory('LinshareShareService', function (Restangular, $log) {
    return {
      getMyShares: function () {
        $log.debug('LinshareShareService : getMyShares');
        return Restangular.all('shares').getList();
      },
      getShare: function(uuid) {
        $log.debug('LinshareShareService : getShare');
        return Restangular.one('shares', uuid).get();
      },
      shareDocuments: function (shareDocument) {
        $log.debug('LinshareShareService : shareDocuments');
        return Restangular.all('shares').post(shareDocument);
      },
      download: function(uuid) {
        $log.debug('LinshareShareService : downloadShare');
        return Restangular.one('shares', uuid).one('download').get();
      },
      downloadThumbnail: function(uuid) {
        $log.debug('LinshareShareService : downloadThumbnail');
        return Restangular.one('shares', uuid).one('thumbnail').get();
      },
      delete: function(uuid) {
        $log.debug('LinshareShareService : delete');
        return Restangular.one('shares', uuid).remove();
      }
    }
  })


/**
 * @ngdoc controller
 * @name linshare.share.controller:LinshareShareController
 * @description
 *
 * The controller to manage shared documents
 */
  .controller('LinshareShareController', function($scope, $filter, ngTableParams, sharedDocumentsList) {
    $scope.tableParams = new ngTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20
    }, {
      getData: function($defer, params) {
        var files =  params.sorting() ? $filter('orderBy')(sharedDocumentsList, params.orderBy()) : sharedDocumentsList;
        params.total(files.length);
        $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  });
