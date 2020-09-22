/**
 * filterBoxService factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('filterBoxService', filterBoxService);

  filterBoxService.$inject = ['_', '$timeout'];

  /**
   * @namespace filterBoxService
   * @desc  Service to manage filterBox component
   * @memberOf linshare.components
   */
  function filterBoxService(_, $timeout) {
    var
      dateFilter = false,
      items,
      itemsInit,
      itemsShowed,
      recipientsFilter = false,
      table,
      unitFilter = false,
      service = {
        getSetDateFilter: getSetDateFilter,
        getSetItems: getSetItems,
        getSetRecipientsFilter: getSetRecipientsFilter,
        getSetTable: getSetTable,
        getSetUnitFilter: getSetUnitFilter,
        reloadTable: reloadTable,
        resetTableList: resetTableList,
        setFilters: setFilters
      };

    return service;

    ////////////


    /**
     * @name getSetDateFilter
     * @desc Get or Set filter date value
     * @property {boolean} value to set for the filter
     * @returns {boolean} value of the filter
     * @memberOf linshare.components.FilterBoxService
     */
    function getSetDateFilter(value) {
      dateFilter = !_.isNil(value) ? value : dateFilter;
      
      return dateFilter;
    }

    /**
     * @name getSetItems
     * @desc Get or Set items of the table
     * @property {Object[]} value to set for the items
     * @returns {Object[]} value of the items
     * @memberOf linshare.components.FilterBoxService
     */
    function getSetItems(value) {
      if (value) {
        itemsInit = _.cloneDeep(value);
        itemsShowed = _.cloneDeep(value);
        items =  value;
      }
      
      return items;
    }

    /**
     * @name getSetRecipientsFilter
     * @desc Get or Set filter recipients value
     * @property {boolean} value to set for the filter
     * @returns {boolean} value of the filter
     * @memberOf linshare.components.FilterBoxService
     */
    function getSetRecipientsFilter(value) {
      recipientsFilter = !_.isNil(value) ? value : recipientsFilter;
      
      return recipientsFilter;
    }

    /**
     * @name getSetTable
     * @desc Get or Set ngTable instance
     * @property {Object[]} value to set for the table
     * @returns {Object[]} value of the table instance
     * @memberOf linshare.components.FilterBoxService
     */
    function getSetTable(value) {
      table = !_.isNil(value) ? value : table;
      
      return table;
    }

    /**
     * @name getSetUnitFilter
     * @desc Get or Set filter unit value
     * @property {boolean} value to set for the filter
     * @returns {boolean} value of the filter
     * @memberOf linshare.components.FilterBoxService
     */
    function getSetUnitFilter(value) {
      unitFilter = !_.isNil(value) ? value : unitFilter;
      
      return unitFilter;
    }

    /**
     * @name reloadTable
     * @desc Reload the table
     * @memberOf linshare.components.filterBoxService
     */
    function reloadTable() {
      table.reload().then(function(data) {
        var params = table._params;

        itemsShowed = (items.slice((params.page - 1) * params.count, params.page *
                                                           params.count));
        if (!_.isEqual(data.length, itemsShowed.length)) {
          $timeout(function() {
            reloadTable();
          }, 0);
        }
      });
    }

    /**
     * @name resetTableList
     * @desc reset table list to initial list
     * @memberOf linshare.components.filterBoxService
     */
    function resetTableList() {
      if (_.isNil(itemsInit)) {
        return;
      }
      if (table.data.length !== itemsShowed.length) {
        _.pullAllBy(itemsInit, itemsShowed, 'uuid');
        if (table.data.length > 0) {
          itemsInit = _.uniqBy(itemsInit.concat(table.data), 'uuid');
        }
      } else if (table.data.length > itemsInit.length ) {
        itemsInit = _.uniqBy(itemsInit.concat(table.data), 'uuid');
      }
      _.pullAll(items, items);
      items.push.apply(items, itemsInit);
    }

    /**
     * @name setFilters
     * @desc Set filters value
     * @property {boolean} value to set for the filters
     * @memberOf linshare.components.filterBoxService
     */
    function setFilters(value) {
      getSetDateFilter(value);
      getSetRecipientsFilter(value);
      getSetUnitFilter(value);
      resetTableList();
      reloadTable();
    }
  }
})();
