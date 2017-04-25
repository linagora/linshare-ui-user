/**
 * AuditController Controller
 * @namespace Audit
 * @memberOf linshare.audit
 */
(function() {
  'use strict';

  angular
    .module('linshare.audit')
    .controller('AuditController', AuditController);

  AuditController.$inject = ['$filter', '$scope', '$translate', '$translatePartialLoader', 'auditDetailsService',
    'auditRestService', 'lsAppConfig', 'tableParamsService'];

  /**
   * @namespace AuditController
   * @desc Application audit management system controller
   * @memberOf LinShare.Audit
   */
  function AuditController($filter, $scope, $translate, $translatePartialLoader, auditDetailsService, auditRestService,
                           lsAppConfig, tableParamsService) {
    /* jshint validthis: true */
    var auditVm = this;

    const EN_DATE_FORMAT = lsAppConfig.date_en_format,
      FILTERS_SELECT_PREFIX = 'FILTERS_SELECT.',
      FR_DATE_FORMAT = lsAppConfig.date_fr_format;

    auditVm.beginDate = new Date();
    auditVm.endDate = new Date();
    auditVm.findAuditActionsByDate = findAuditActionsByDate;
    auditVm.maxDate = new Date();
    auditVm.tableFilterAction = [];
    auditVm.tableFilterType = [];

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.Audit.AuditController
     */
    function activate() {
      $translatePartialLoader.addPart('audit');

      auditVm.dateFormat = $translate.use() === 'fr-FR' ? FR_DATE_FORMAT : EN_DATE_FORMAT;
      auditVm.beginDate.setDate(auditVm.beginDate.getDate() - 7);

      findAuditActionsByDate();
    }

    /**
     * @name findAuditActionsByDate
     * @desc Get audit actions from server and apply them to the tableParam with related filters
     * @memberOf LinShare.Audit.AuditController
     */
    function findAuditActionsByDate() {
      auditVm.beginDate.setHours(0, 0, 0, 0);
      auditVm.endDate.setHours(24, 0, 0, 0);

      auditRestService.getList({
        beginDate: auditVm.beginDate,
        endDate: auditVm.endDate
      }).then(function(auditActionsList) {
        auditVm.itemsList = auditActionsList.plain();

        auditDetailsService.generateAllDetails($scope.userLogged.uuid, auditVm.itemsList);
        generateTableFilterSelect(auditVm.tableFilterType, 'type');
        generateTableFilterSelect(auditVm.tableFilterAction, 'action');

        if (_.isUndefined(auditVm.tableParams)) {
          launchTableParamsInitiation();
        } else {
          auditVm.tableParams.reload();
        }
      });
    }

    /**
     * @name generateTableFilterSelect
     * @desc Generate multi select menus
     * @param {Array<String>} select - Multi select to fill
     * @param {string} column - Name of the related multi select
     * @memberOf LinShare.Audit.AuditController
     */
    function generateTableFilterSelect(select, column) {
      select.length = 0;
      var values = _.uniq(_.map(auditVm.itemsList, column)).sort();
      _.pull(values, 'ANONYMOUS_SHARE_ENTRY');
      _.forEach(values, function(value) {
        var translatedValue = $filter('translate')(FILTERS_SELECT_PREFIX + column.toUpperCase() + '.' + value);
        select.push({id: translatedValue, title: translatedValue});
      });
      select.sort(function(a, b) {
        return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);
      });
      select.unshift({id: '', title: $filter('translate')(FILTERS_SELECT_PREFIX + column.toUpperCase() + '.ALL')});
    }

    /**
     * @name launchTableParamsInitiation
     * @desc Initialize tableParams and related functions
     * @memberOf LinShare.Audit.AuditController
     */
    function launchTableParamsInitiation() {
      tableParamsService.initTableParams(auditVm.itemsList);
      auditVm.tableParamsService = tableParamsService;
      auditVm.tableParams = tableParamsService.getTableParams();
      auditVm.tableApplyFilter = tableParamsService.tableApplyFilter;
      auditVm.tableSort = tableParamsService.tableSort;

      // TODO : implement sorting in initTableParams (a PR dedicated to this will be better, for doing it properly)
      auditVm.tableParams.sorting('creationDate');
    }
  }
})();
