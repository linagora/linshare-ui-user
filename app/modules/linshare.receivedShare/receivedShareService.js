'use strict';

/**
 * @ngdoc overview
 * @name linshare.share
 * @description
 *
 * This module has two services written
 * to make all http calls about sharing file.
 */
angular.module('linshare.receivedShare', ['restangular'])
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
      downloadThumbnail: function(uuid) {
        $log.debug('LinshareReceivedShareService : downloadThumbnail');
        return Restangular.one('received_shares', uuid).one('thumbnail').get();
      },
      delete: function(uuid) {
        $log.debug('LinshareReceivedShareService : delete');
        return Restangular.one('received_shares', uuid).remove();
      },
      copy: function(uuid) {
        $log.debug('LinshareReceivedShareService : copy', uuid);
        return Restangular.one('received_shares').one('copy', uuid).post();
      },
      download: function(uuid) {
        $log.debug('LinshareReceivedShareService : download');
        return Restangular.one('received_shares', uuid).one('download').get();
      }
    };
  });
