/**
 * @file Angular service to interact with AnonymousUrl API
 * @copyright LINAGORA © 2009–2019
 * @license AGPL-3.0
 * @module LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .factory('anonymousUrlService', anonymousUrlService);

  anonymousUrlService.$inject = [
    '$http',
    '$log',
    '$q'
  ];

  /**
   * @description Service to interact with AnonymousUrl
   * @class anonymousUrlService
   * @memberOf LinShare.anonymousUrl
   */
  //TODO - KLE : SET RESTANGULAR
  function anonymousUrlService($http, $log, $q) {
    /** @constant
     *  @description API endpoint for anonymous url management
     *  @type {string}
     *  @default
     */
    const baseRestUrl = 'linshare/webservice/rest/external/anonymousurl';
    var service = {
      baseUrl: baseRestUrl,
      download: download,
      downloadUrl: downloadUrl,
      getAnonymousUrl: getAnonymousUrl
    };

    return service;

    ////////////

    /**
     *  @async
     *  @name download
     *  @description Donwload a document
     *  @param {string} urlUuid - The id of the anonymous url
     *  @param {string} password - The password to access to the anonymous url
     *  @param {string} docUuid - The id of the document
     *  @returns {promise} Server response
     */
    function download(urlUuid, password, docUuid) {
      var deferred = $q.defer();
      $http.get(downloadUrl(urlUuid, password, docUuid), {
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
     *  @async
     *  @name downloadUrl
     *  @descriptionGet download url of the document given
     *  @param {string} urlUuid - The id of the anonymous url
     *  @param {string} password - The password to access to the anonymous url
     *  @param {string} docUuid - The id of the document
     *  @returns {string} Download url
     */
    function downloadUrl(urlUuid, password, docUuid) {
      return [baseRestUrl, urlUuid, docUuid, 'download'].join('/');
    }

    /**
     *  @async
     *  @name getAnonymousUrl
     *  @description Retrieve information from the anonymous share url
     *  @param {String} uuid - The id of the anonymous url
     *  @param {String} password - The password to access to the anonymous url
     *  @returns {Promise} Server response
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
