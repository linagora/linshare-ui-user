/**
 * auditRestService factory
 * @namespace LinShare.audit
 */
(function() {
  'use strict';

  angular
    .module('linshare.audit')
    .factory('auditRestService', auditRestService);

  auditRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

  /**
   * @namespace auditRestService
   * @desc Service to interact with Audit object by REST
   * @memberOf LinShare.audit
   */
  function auditRestService($log, Restangular, ServerManagerService) {
    var
      handler = ServerManagerService.responseHandler,
      restUrl = 'audit',
      service = {
        getList: getList
      };

    return service;

    ////////////

    //TODO: Add description to the doc

    /**
     * The domain object
     * @typedef {Object} Domain
     * @property {String} uuid
     * @property {String} label
     */

    /**
     * The authUser object
     * @typedef {Object} AuthUser
     * @property {String} name
     * @property {String} mail
     * @property {String} uuid
     * @property {String} role
     * @property {String} accountType
     * @property {@link Domain} domain
     */

    /**
     * The actor object
     * @typedef {Object} Actor
     * @property {String} name
     * @property {String} mail
     * @property {String} uuid
     * @property {String} role
     * @property {String} accountType
     * @property {@link Domain} domain
     */

    /**
     * The workgroup object
     * @typedef {Object} Workgroup
     * @property {String} uuid
     * @property {String} creationDate
     * @property {String} name
     */

    /**
     * The resource object
     * @typedef {Object} Resource
     * @property {String} type
     * @property {String} uuid
     * @property {String} name
     * @property {String} parent
     * @property {String} workGroup
     * @property {String} description
     * @property {String} metaData
     * @property {String} creationDate
     * @property {String} modificationDate
     * @property {String} size
     * @property {String} mimeType
     * @property {String} sha256sum
     * @property {String} uploadDate
     * @property {String} hasThumbnail
     */

    /**
     * The Audit object.
     * @typedef {Object} Audit
     * @property {String} type - For a audit it's equal to `WorkGroupNodeAuditLogEntry`
     * @property {String} uuid - Id of the audit
     * @property {@link AuthUser} authUser - The connected user
     * @property {String} resourceUuid - Id of the resource
     * @property {String} action - The action executed by the actor
     * @property {String} type - The type of node that takes action
     * @property {String} creationDate - Date of revision creation
     * @property {@link Actor} actor who done the action
     * @property {@link Workgroup} workGroup - The workgroup that contains the node
     * @property {@link Resource} resource - The node that takes the action
     */


    /**
     * @name getList
     * @desc Get list of the audit object
     * @param {Object} [params] - Parameters added to do a search by date
     * @property {Date} params.beginDate - Begin date of audit to find
     * @property {Date} params.endDate - End date of audit to find
     * @returns {Promise} server response
     * @memberOf LinShare.audit.auditRestService
     */
    function getList(params) {
      $log.debug('auditRestService : getList');
      
      return handler(Restangular.all(restUrl).getList(params));
    }
  }
})();
