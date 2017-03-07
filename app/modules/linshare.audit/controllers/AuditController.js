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
    'auditRestService', 'lsAppConfig', 'NgTableParams'];

  /**
   * @namespace AuditController
   * @desc Application audit management system controller
   * @memberOf LinShare.Audit
   */
  function AuditController($filter, $scope, $translate, $translatePartialLoader, auditDetailsService, auditRestService,
                           lsAppConfig, NgTableParams) {
    /* jshint validthis: true */
    var auditVm = this;

    const EN_DATE_FORMAT = lsAppConfig.date_en_format,
      FILTERS_SELECT_PREFIX = 'FILTERS_SELECT.',
      FR_DATE_FORMAT = lsAppConfig.date_fr_format;

    auditVm.beginDate = new Date();
    auditVm.endDate = new Date();
    auditVm.findAuditActionsByDate = findAuditActionsByDate;
    auditVm.maxDate = new Date();
    auditVm.paramFilter = {};
    auditVm.tableApplyFilter = tableApplyFilter;
    auditVm.tableFilterAction = [];
    auditVm.tableFilterType = [];
    auditVm.tableSort = tableSort;
    auditVm.toggleSelectedSort = true;
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
          auditVm.tableParams = loadTable();
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
     * @name loadTable
     * @desc Load the table
     * @memberOf LinShare.Audit.AuditController
     */
    function loadTable() {
      return new NgTableParams({
        page: 1,
        sorting: {
          creationDate: 'desc'
        },
        count: 10,
        filter: auditVm.paramFilter
      }, {
        getData: function(params) {
          var filteredData = params.hasFilter() ? $filter('filter')(auditVm.itemsList, params.filter()) : auditVm.itemsList;
          var auditActions = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(auditActions.length);
          params.settings({counts: filteredData.length > 10 ? [10, 25, 50, 100] : []});
          return (auditActions.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    }

    /**
     * @name tableApplyFilter
     * @desc Helper to apply a filter on a selection of colum
     * @param {String} filterValue - The value to use for the filters
     * @param {Array<String>} columns - The name of the column to apply the filter on
     * @param {String} operator - The filter operator
     * @memberOf LinShare.Audit.AuditController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableApplyFilter(filterValue, columns, operator) {
      _.forEach(columns, function(column) {
        auditVm.paramFilter[column] = filterValue;
      });
      auditVm.paramFilter.operator = operator ? operator : '&&';
      auditVm.tableParams.filter(auditVm.paramFilter);
      auditVm.tableParams.reload();
    }

    /**
     * @name tableSort
     * @desc Helper to sort element in table and set the visual on the right column
     * @param {String} sortField - Name of the field to be sorted
     * @param {jQuery.Event} $event - Event bound to the change
     * @memberOf LinShare.Audit.AuditController
     */
    //TODO - KLE: Refactor|Should be in a helper class and not repeated everytime we use a table, see the directive ?
    function tableSort(sortField, $event) {
      auditVm.toggleSelectedSort = !auditVm.toggleSelectedSort;
      auditVm.tableParams.sorting(sortField, auditVm.toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.files .sort-dropdown a ').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }
  }
})();
