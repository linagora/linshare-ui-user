/**
 * sidebarAuditActionsTab Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('sidebarAuditActionsTabController', sidebarAuditActionsTabController);

  sidebarAuditActionsTabController.$inject = [
    '$log',
    '$q',
    'workgroupRestService',
    'uploadRequestEntryRestService',
    'uploadRequestRestService',
    'uploadRequestGroupRestService',
    'auditDetailsService',
    'authenticationRestService'
  ];

  function sidebarAuditActionsTabController(
    $log,
    $q,
    workgroupRestService,
    uploadRequestEntryRestService,
    uploadRequestRestService,
    uploadRequestGroupRestService,
    auditDetailsService,
    authenticationRestService
  ) {
    let deferred;
    const sidebarAuditActionsTabVm = this;
    const getters = {
      workgroup: workgroupRestService.getAudit,
      uploadRequest: uploadRequestRestService.getAudit,
      uploadRequestGroup: uploadRequestGroupRestService.getAudit,
      uploadRequestEntry: uploadRequestEntryRestService.getAudit,
    };

    sidebarAuditActionsTabVm.$onInit = $onInit;
    sidebarAuditActionsTabVm.$onChanges = $onChanges;
    sidebarAuditActionsTabVm.getAuditActions = function() {
      getAuditActions(sidebarAuditActionsTabVm.uuid);
    };

    ////////////

    function $onInit() {
      sidebarAuditActionsTabVm.status = 'loading';

      authenticationRestService.getCurrentUser().then(function(userLogged) {
        sidebarAuditActionsTabVm.userLogged = userLogged;
      });
    }

    function $onChanges(changes) {
      if (
        changes && changes.uuid &&
        typeof changes.uuid.previousValue === 'string' && //do not load when previous value is uninitialized
        sidebarAuditActionsTabVm.isActive
      ) {
        sidebarAuditActionsTabVm.status = 'loading';

        getAuditActions(changes.uuid.currentValue);
      }
    }

    function getAuditActions(uuid) {
      if (deferred) {
        deferred.reject();
      }

      deferred = $q.defer();

      getters[sidebarAuditActionsTabVm.type](uuid)
        .then(function(auditData) {
          return auditDetailsService.generateAllDetails(sidebarAuditActionsTabVm.userLogged.uuid, auditData.plain());
        })
        .then(deferred.resolve)
        .catch(deferred.reject);

      deferred.promise
        .then(function(auditActions) {
          sidebarAuditActionsTabVm.status = 'loaded';
          sidebarAuditActionsTabVm.auditActions = auditActions;
        })
        .catch(function(error) {
          if (error) {
            $log.error('Load audit actions for ' + sidebarAuditActionsTabVm.type + ': failed', error);
          }
        });
    }
  }
})();
