'use strict';

/**
 * @ngdoc overview
 * @name linshare.share
 * @description
 *
 * This module has two services written
 * to make all http calls about sharing file.
 */
angular.module('linshare.share', [])
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
 * @ngdoc service
 * @name linshare.share.service:LinshareReceivedShareService
 * @description
 *
 * Service to get and post all information about files others shared with me
 */
  .factory('LinshareReceivedShareService', function (Restangular, $log) {
    return {
      getReceivedShares: function () {
        $log.debug('LinshareReceivedShareService : getReceivedShares');
        return Restangular.all('received_shares').getList();
      },
      getReceivedShare: function(uuid) {
        $log.debug('LinshareReceivedShareService : getReceivedShare');
        return Restangular.one('received_shares', uuid).get();
      },
      downloadThumbnail: function() {
        $log.debug('LinshareReceivedShareService : downloadThumbnail');
        return Restangular.one('received_shares', uuid).one('thumbnail').get();
      },
      delete: function(uuid) {
        $log.debug('LinshareReceivedShareService : delete');
        return Restangular.one('received_shares', uuid).remove();
      },
      copy: function(uuid) {
        $log.debug('LinshareReceivedShareService : copy');
        return Restangular.one('received_shares').one(copy, uuid).post();
      },
      download: function(uuid) {
        $log.debug('LinshareReceivedShareService : download');
        return Restangular.one('received_shares', uuid).one('donwload').get();
      }
    };
  });
