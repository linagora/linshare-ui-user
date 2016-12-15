/**
 * anonymousUrlService Service
 * @namespace LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .factory('anonymousUrlService', anonymousUrlService);

  anonymousUrlService.$inject = ['$http', '$log', '$q'];

  /**
   *  @namespace anonymousUrlService
   *  @desc Service to interact with AnonymousUrl
   *  @memberOf LinShare.anonymousUrl
   */
  //TODO - KLE : SET RESTANGULAR
  function anonymousUrlService($http, $log, $q) {
    var
      baseRestUrl = 'linshare/webservice/rest/external/anonymousurl',
      service = {
        baseUrl: baseRestUrl,
        download: download,
        getAnonymousUrl: getAnonymousUrl,
        status: status
      };

    return service;

    ////////////

    /**
     *  @name download
     *  @desc Donwload a document
     *  @param {String} urlUuid - The id of the anonymous url
     *  @param {String} password - The password to access to the anonymous url
     *  @param {String} docUuid - The id of the document
     *  @returns {Promise} Server response
     *  @memberOf LinShare.anonymousUrl.anonymousUrlService
     */
    function download(urlUuid, password, docUuid) {
      var deferred = $q.defer();
      $http.get([baseRestUrl, urlUuid, docUuid, 'download'].join('/'), {
        headers: {
          'linshare-anonymousurl-password': password
        },
        responseType: 'arraybuffer'
      }).then(function(documents) {
        deferred.resolve(documents);
      });
      return deferred.promise;
    }

    /**
     *  @name getAnonymousUrl
     *  @desc Retrieve information from the anonymous share url
     *  @param {String} uuid - The id of the anonymous url
     *  @param {String} password - The password to access to the anonymous url
     *  @returns {Promise} Server response
     *  @memberOf LinShare.anonymousUrl.anonymousUrlService
     */
    function getAnonymousUrl(uuid, password) {
      var deferred = $q.defer();
      $http.get(baseRestUrl + '/' + uuid, {
        headers: {
          'linshare-anonymousurl-password': password
        }
      }).then(function(response) {
        deferred.resolve(response);
      }).catch(function(error) {
        if (error.status === 403) {
          deferred.resolve(error);
        } else if (error.status === 404) {
          deferred.reject(error);
        }
      });
      return deferred.promise;
    }
  }
})();
