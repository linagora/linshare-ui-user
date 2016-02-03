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
      },
      autocomplete: function(pattern) {
        $log.debug('FileService:autocomplete');
        return Restangular.all('users').one('autocomplete', pattern).get();
      }
    };
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
  })

  .controller('LinshareShareActionController', function($scope, LinshareShareService, $log, $stateParams, growlService, $translate) {
    $scope.share = {
      recipients: [],
      documents: []
    };

    angular.forEach($scope.selectedDocuments, function(doc) {
      $scope.share.documents.push(doc.uuid);
    });

    $scope.$watch('selectedDocuments', function(n) {
      if (n) {
        $scope.share.documents = [];
        angular.forEach(n, function(doc) {
          $scope.share.documents.push(doc.uuid);
        });
      }
    }, true);

    $translate('GROWL_ALERT.SHARE').then(function(translations) {
      $scope.growlMsgShareSuccess = translations;
    });

    $scope.selectedContact = {};
    $scope.submitShare = function(shareCreationDto) {
      angular.forEach($scope.selectedDocuments, function(doc) {
        shareCreationDto.documents.push(doc.uuid);
      });
      if ($scope.selectedContact.length > 0) {
        shareCreationDto.recipients.push({mail: $scope.selectedContact});
      }
      LinshareShareService.shareDocuments(shareCreationDto).then(function() {
        $scope.share.recipients = [];
        growlService.growl($scope.growlMsgShareSuccess, 'inverse');
        $scope.$emit('linshare-upload-complete');
      });
    };

    $scope.filesToShare = $stateParams.selected;
  })
  .controller('LinshareAdvancedShareController', function($scope, allFunctionalities) {
    angular.forEach($scope.filesToShare, function(doc) {
      $scope.share.documents.push(doc.uuid);
    });
    $scope.allFunctionalities = allFunctionalities;

  });
