'use strict';

angular.module('linshare.share')

/**
 * @ngdoc controller
 * @name linshare.share.controller:LinshareShareController
 * @description
 *
 * The controller to manage shared documents
 */
  .controller('LinshareShareController', function($scope, $filter, NgTableParams, sharedDocumentsList) {
    $scope.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      count: 20
    }, {
      getData: function(params) {
        var files = params.sorting() ? $filter('orderBy')(sharedDocumentsList, params.orderBy()) : sharedDocumentsList;
        params.total(files.length);
        return (files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  });
