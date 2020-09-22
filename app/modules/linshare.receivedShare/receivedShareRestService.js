/**
 * receivedShareRestService factory
 * @namespace LinShare.receivedShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.receivedShare')
    .factory('receivedShareRestService', receivedShareRestService);

  receivedShareRestService.$inject = ['_', '$log', 'Restangular', 'ServerManagerService'];

  /**
   *  @namespace receivedShareRestService
   *  @desc Service to interact with ReceivedShare object by REST
   *  @memberOf LinShare.receivedShare
   */
  function receivedShareRestService(_, $log, Restangular, ServerManagerService) {
    var
      handler = {
        simple: ServerManagerService.responseHandler,
        multi: ServerManagerService.multiResponsesHanlder
      },
      restUrl = {
        documents: 'documents',
        receivedShares: 'received_shares'
      },
      service = {
        copy: copy,
        download: download,
        get: get,
        getAudit: getAudit,
        getList: getList,
        remove: remove,
        thumbnail: thumbnail
      };

    return service;

    ////////////

    /**
     *  @name copy
     *  @desc Copy one or multiple ReceivedShares object to the personal space
     *  @param {Object[]} documents - The ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function copy(documents) {
      if (documents.length === 1) {
        $log.debug('LinshareReceivedShareRestService : copy', documents[0].uuid);
        
        return handler.simple(Restangular.one(restUrl.documents).all('copy').post({
          kind: 'RECEIVED_SHARE',
          uuid: documents[0].uuid
        }));
      } else {
        $log.debug('LinshareReceivedShareRestService : copy multi');
        var promises = [];

        _.forEach(documents, function(object) {
          var response = Restangular.one(restUrl.documents).all('copy').post({
            kind: 'RECEIVED_SHARE',
            uuid: object.uuid
          });

          promises.push({response: response, object: object});
        });
        
        return handler.multi(promises, {
          key: 'COPY',
          pluralization: true
        });
      }
    }

    /**
     *  @name download
     *  @desc Download file of a ReceivedShares object
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {string} direct download url of the ressource
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function download(uuid) {
      $log.debug('LinshareReceivedShareRestService : download', uuid);
      
      return Restangular.all(restUrl.receivedShares).one(uuid, 'download').getRequestedUrl();
    }

    /**
     *  @name get
     *  @desc Get a ReceivedShares object
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function get(uuid) {
      $log.debug('LinshareReceivedShareRestService : get', uuid);
      
      return handler.simple(Restangular.one(restUrl.receivedShares, uuid).get());
    }

    /**
     *  @name getAudit
     *  @desc Get audit of a ReceivedShares object
     *  @param {string} receivedSharesUuid - The uuid of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function getAudit(receivedSharesUuid) {
      $log.debug('LinshareReceivedShareRestService : getAudit', receivedSharesUuid);
      
      return handler.simple(Restangular.one(restUrl.receivedShares, receivedSharesUuid).one('audit').get());
    }

    /**
     *  @name getList
     *  @desc Get list of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function getList() {
      $log.debug('LinshareReceivedShareRestService : getList');
      
      return handler.simple(Restangular.all(restUrl.receivedShares).getList());
    }

    /**
     *  @name remove
     *  @desc Remove a ReceivedShares object
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function remove(uuid) {
      $log.debug('LinshareReceivedShareRestService : delete', uuid);
      
      return handler.simple(Restangular.one(restUrl.receivedShares, uuid).remove());
    }

    /**
     *  @name thumbnail
     *  @desc Get the thumbnail of a ReceivedShares object file
     *  @param {String} uuid - The id of the ReceivedShares object
     *  @returns {Promise} server response
     *  @memberOf LinShare.receivedShare.receivedShareRestService
     */
    function thumbnail(uuid) {
      $log.debug('LinshareReceivedShareRestService : thumbnail', uuid);
      
      return handler.simple(Restangular.one(restUrl.receivedShares, uuid).one('thumbnail').get({
        base64: true
      }));
    }
  }
})();
