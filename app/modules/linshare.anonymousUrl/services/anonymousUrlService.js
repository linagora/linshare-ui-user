/**
 * @author Alpha O. Sall
 */

'use strict';

angular.module('linshare.anonymousUrl')
  .factory('AnonymousUrlService', anonymousUrlService);

function anonymousUrlService($http, $log, $q, lsAnonymousUrlConfig, $uibModal, $stateParams) {
  var anonymousUrlUuid = $stateParams.uuid;
  var baseRestUrl = lsAnonymousUrlConfig.baseRestUrl;
  var password = '';
  var status = null;
  var deferred = $q.defer();

  //getAnonymousUrl(anonymousUrlUuid);

  return {
    getAnonymousUrl: getAnonymousUrl,
    download: function(uuid) {
      var downloaDefer = $q.defer();
      $http.get([baseRestUrl, anonymousUrlUuid, uuid, 'download'].join('/'),
        {
          headers: {'linshare-anonymousurl-password': password},
          responseType: 'arraybuffer'
        }
      ).then(function(documents) {
        downloaDefer.resolve(documents);
      });
      return downloaDefer.promise;
    },
    baseUrl: baseRestUrl,
    status: status
  };

  function getAnonymousUrl(uuid) {
    anonymousUrlUuid = uuid;
    $http.get(baseRestUrl + '/' + uuid, {headers: {'linshare-anonymousurl-password': password}}
    ).then(callbackSuccess, callbackError);
    return deferred.promise;
  }

  function callbackSuccess(response) {
    anonymousUrlUuid = response.data.uuid;
    deferred.resolve(response);
    status = 200;
  }

  function callbackError(error) {
    if (error.status === 403) {
      status = error.status;
      $uibModal.open({
        backdrop: 'static',
        backdropClass: 'modal-backdrop',
        controller: function($scope, $uibModalInstance) {
          $scope.submitPassword = function() {
            password = $scope.urlPassword;
            $http.get(baseRestUrl + '/' + anonymousUrlUuid, {headers: {'linshare-anonymousurl-password': password}}
            ).then(function(anonymousUrl) {
              $scope.cancel();
              anonymousUrlUuid = anonymousUrl.data.uuid;
              deferred.resolve(anonymousUrl);
            });
          };
          $scope.cancel = function() {
            $uibModalInstance.close();
          };
        },
        templateUrl: 'modules/linshare.anonymousUrl/views/passwordModal.html'
      });

    } else if (error.status === 404) {
      $log.debug('anonymous url not found');
      status = error.status;
    }
  }
}
