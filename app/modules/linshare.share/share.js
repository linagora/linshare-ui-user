'use strict';

angular.module('linshare.share', [])
  .factory('LinshareShareService', function (Restangular) {
    return {
      getMyShares: function () {
        return Restangular.all('shares').getList();
      },
      shareDocuments: function (shareDocument) {
        return Restangular.all('shares').post(shareDocument);
      }
    }
  })
  .factory('LinshareReceivedShareService', function (Restangular) {
    return {
      getReceivedShares: function () {
        return Restangular.all('received_shares').getList();
      }
    };
  });
