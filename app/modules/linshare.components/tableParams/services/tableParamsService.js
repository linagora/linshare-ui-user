/**
 * tableParamsService factory
 * @namespace LinShare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('tableParamsService', tableParamsService);

  tableParamsService.$inject = ['$filter', '$q', 'lsAppConfig', 'NgTableParams'];

  /**
   * @namespace tableParamsService
   * @desc Service to interact with tableParams
   * @memberOf LinShare.components
   */
  function tableParamsService($filter, $q, lsAppConfig, NgTableParams) {
    var
      /* @property {Object} flagsOnSelectedPages - Object with number of page as key, and boolean as value (true if all elements in this page are selected, and false if not all) */
      flagsOnSelectedPages,
      /* @property {Array<Object>} itemsList - Items to display in tableParams */
      itemsList,
      /* @property Check tableParams library */
      paramCount,
      /* @property Check tableParams library */
      paramFilter,
      /* @property Check tableParams library */
      paramSorting,
      /* @property {boolean} selectionIsIsolated - True when selection is isolated */
      selectionIsIsolated,
      /* @property {Array<Object>} selectedItemsList - Items selected */
      selectedItemsList,
      /* @property Check tableParams library */
      tableParams,
      /* @property {boolean} toggleSelectedSort - True when sorting is activated in tableParams */
      toggleSelectedSort,
      service = {
        getFlagsOnSelectedPages: getFlagsOnSelectedPages,
        getSelectedItemsList: getSelectedItemsList,
        getSelectionIsIsolated: getSelectionIsIsolated,
        getTableParams: getTableParams,
        getToggleSelectedSort: getToggleSelectedSort,
        initTableParams: initTableParams,
        isolateSelection: isolateSelection,
        lengthOfSelectedDocuments: lengthOfSelectedDocuments,
        reloadTableParams: reloadTableParams,
        resetSelectedItems: resetSelectedItems,
        resetFlagsOnSelectedPages: resetFlagsOnSelectedPages,
        tableApplyFilter: tableApplyFilter,
        tableSelectAll: tableSelectAll,
        tableSort: tableSort,
        toggleItemSelection: toggleItemSelection
      };

    return service;

    ////////////

    /**
     * @name getFlagsOnSelectedPages
     * @desc Return the flagsOnSelectedPages
     * @returns {Object} flagsOnSelectedPages
     * @memberOf LinShare.components.tableParamsService
     */
    function getFlagsOnSelectedPages() {
      return flagsOnSelectedPages;
    }

    /**
     * @name getSelectedItemsList
     * @desc Return the selectedItemsList
     * @returns {Array<Object>} selectedItemsList
     * @memberOf LinShare.components.tableParamsService
     */
    function getSelectedItemsList() {
      return selectedItemsList;
    }

    /**
     * @name getSelectionIsIsolated
     * @desc Return the activeBtnShowSelection
     * @returns {boolean} activeBtnShowSelection
     * @memberOf LinShare.components.tableParamsService
     */
    // TODO to be removed when view's table directive will be developped
    function getSelectionIsIsolated() {
      return selectionIsIsolated;
    }

    /**
     * @name getTableParams
     * @desc Return the tableParams
     * @returns {NgTableParams} tableParams
     * @memberOf LinShare.components.tableParamsService
     */
    function getTableParams() {
      return tableParams;
    }

    /**
     * @name getToggleSelectedSort
     * @desc Return the toggleSelectedSort
     * @returns {boolean} toggleSelectedSort
     * @memberOf LinShare.components.tableParamsService
     */
    function getToggleSelectedSort() {
      return toggleSelectedSort;
    }

    /**
     * @name initVariables
     * @desc Initialize/reset all variables of the service
     * @memberOf LinShare.components.tableParamsService
     */
    function initVariables() {
      flagsOnSelectedPages = {};
      itemsList = {};
      paramCount = lsAppConfig.tableParams.count;
      paramFilter = {};
      paramSorting = lsAppConfig.tableParams.sorting;
      selectedItemsList = [];
      selectionIsIsolated = false;
      tableParams = null;
      toggleSelectedSort = true;
    }

    /**
     * @name initTableParams
     * @desc Initialize tableParams
     * @param {Array<Object>} tableList - DataSet to display in the tableParams
     * @param {Object} [filter] - Filters of tableParams
     * @param {string} [itemToSelectUuid] - The uuid of the item object to select
     * @returns {Promise} server response
     * @memberOf LinShare.components.tableParamsService
     */
    function initTableParams(tableList, filter, itemToSelectUuid) {
      return $q(function(resolve) {
        initVariables();
        itemsList = tableList;
        paramFilter = filter || {};
        var selectOneItem = !_.isNil(itemToSelectUuid);
        tableParams = new NgTableParams({
          page: selectOneItem ? loadSpecificPage(itemsList, itemToSelectUuid) : 1,
          sorting: paramSorting,
          count: paramCount,
          filter: paramFilter
        }, {
          getData: function(params) {
            var filteredData = params.filter() ? $filter('filter')(itemsList, params.filter()) : itemsList;
            var items = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
            params.total(items.length);
            if (selectOneItem) {
              loadItemSelection(filteredData, itemToSelectUuid);
            }
            return (items.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        });
        resolve(tableParams);
      });
    }

    /**
     * @name isolateSelection
     * @desc Isolate the selection list
     * @memberOf LinShare.components.tableParamsService
     */
    function isolateSelection() {
      selectionIsIsolated = !selectionIsIsolated;
      if (tableParams.filter().isSelected) {
        delete tableParams.filter().isSelected;
      } else {
        tableParams.filter().isSelected = true;
      }
    }

    /**
     * @name lengthOfSelectedDocuments
     * @desc Return length of selectedItemsList
     * @returns {number} length of selectedItemsList
     * @memberOf LinShare.components.tableParamsService
     */
    function lengthOfSelectedDocuments() {
      return selectedItemsList.length;
    }

    /**
     * @name loadItemSelection
     * @desc Add item to selectedItemsList
     * @param {Array<Object>} filteredData - Array of filtered items
     * @param {string} itemToSelectUuid - The uuid of the item object to select
     * @memberOf LinShare.components.tableParamsService
     */
    function loadItemSelection(filteredData, itemToSelectUuid) {
      var itemToSelect = _.find(filteredData, {'uuid': itemToSelectUuid});
      itemToSelectUuid = null;
      if (!_.isUndefined(itemToSelect)) {
        toggleItemSelection(itemToSelect);
      }
    }

    /**
     * @name loadSpecificPage
     * @desc If item to select is not in first page of the table, this algorithm find the page to display
     * @param {Array<Object>} tableList - List of the data to display in the tableParams
     * @param {string} itemToSelectUuid - The uuid of the item object to select
     * @memberOf LinShare.components.tableParamsService
     */
    function loadSpecificPage(tableList, itemToSelectUuid) {
      var items = _.orderBy(tableList, 'modificationDate', ['desc']);
      if (itemToSelectUuid) {
        return Math.floor(_.findIndex(items, {'uuid': itemToSelectUuid}) / paramCount) + 1;
      }
      return 1;
    }

    /**
     * @name removeItemFromSelectedItemsList
     * @desc Remove items from selectedItemsList
     * @param {Array<Object>} selectedItems - List of selected items
     * @memberOf LinShare.components.tableParamsService
     */
    function removeItemFromSelectedItemsList(selectedItems) {
      for(var i = selectedItems.length - 1; i >= 0; i--) {
        selectedItems[i].isSelected = false;
        selectedItems.splice(i, 1);
      }
    }

    /**
     * @name reloadTableParams
     * @desc Reload tableParams
     * @param {Array<Object>} [tableList] - List to display in tableParams
     * @memberOf LinShare.components.tableParamsService
     */
    function reloadTableParams(tableList) {
      if(!_.isNil(tableList)) {
        itemsList = tableList;
      }
      return tableParams.reload();
    }

    /**
     * @name resetSelectedItems
     * @desc Clear selected elements list array
     * @memberOf LinShare.components.tableParamsService
     */
    function resetSelectedItems() {
      selectionIsIsolated = false;
      delete tableParams.filter().isSelected;
      removeItemFromSelectedItemsList(selectedItemsList);
      resetFlagsOnSelectedPages();
    }

    /**
     * @name resetFlagsOnSelectedPages
     * @desc Clear flagsOnSelectedPages object
     * @param {Array<Object>} flags - flagsOnSelectedPages object
     * @memberOf LinShare.components.tableParamsService
     */
    function resetFlagsOnSelectedPages(flags) {
      var flagsObject = flags || flagsOnSelectedPages;
      _.forEach(flagsObject, function(value, key) {
        flagsObject[key] = false;
      });
    }

    /**
     * @name tableApplyFilter
     * @desc Helper to apply a filter on a selection of columns
     * @param {string} filterValue - The value to use for the filters
     * @param {Array<string>} columns - The name of the column to apply the filter on
     * @param {string} operator - The filter operator
     * @memberOf LinShare.components.tableParamsService
     */
    function tableApplyFilter(filterValue, columns, operator) {
      _.forEach(columns, function(column) {
        paramFilter[column] = filterValue;
      });
      tableParams.operator = operator ? operator : '&&';
      tableParams.filter(paramFilter);
      tableParams.reload();
    }

    /**
     *  @name tableSelectAll
     *  @desc Helper to select all element of the current table page
     *  @param {Array<Object>} [data] - List of element to be selected
     *  @param {number} [page] - Page number of the table
     *  @param {boolean} [selectFlag] - If the current page has the flag or not
     *  @memberOf LinShare.components.tableParamsService
     */
    function tableSelectAll(data, page, selectFlag) {
      var dataOnPage = data || tableParams.data;
      var currentPage = page || tableParams.page();
      var select = selectFlag || flagsOnSelectedPages[currentPage];
      if (!select) {
        _.forEach(dataOnPage, function(element) {
          if (!element.isSelected) {
            element.isSelected = true;
            selectedItemsList.push(element);
          }
        });
        flagsOnSelectedPages[currentPage] = true;
      } else {
        _.forEach(dataOnPage, function(element) {
          if (_.find(selectedItemsList, element)) {
            element.isSelected = false;
            _.remove(selectedItemsList, function(item) {
              removeItemFromSelectedItemsList(item);
              return item.uuid === element.uuid;
            });
          }
        });
        flagsOnSelectedPages[currentPage] = false;
      }
    }

    /**
     * @name tableSort
     * @desc Helper to sort element in table and set the visual on the right column
     * @param {string} sortField - Name of the field to be sorted
     * @param {jQuery.Event} $event - Event bound to the change
     * @memberOf LinShare.components.tableParamsService
     */
    // TODO: directive with related code in views, then maybe remove this function entirely
    function tableSort(sortField, $event) {
      toggleSelectedSort = !toggleSelectedSort;
      tableParams.sorting(sortField, toggleSelectedSort ? 'desc' : 'asc');
      var currTarget = $event.currentTarget;
      angular.element('.sort-dropdown a').removeClass('selected-sorting').promise().done(function() {
        angular.element(currTarget).addClass('selected-sorting');
      });
    }

    /**
     * @name toggleItemSelection
     * @desc Add item to the selection list
     * @param {Object} item - Item to add in selection list
     * @memberOf LinShare.components.tableParamsService
     */
    function toggleItemSelection(item) {
      item.isSelected = !item.isSelected;
      if (item.isSelected) {
        selectedItemsList.push(item);
      } else {
        var index = selectedItemsList.indexOf(item);
        if (index > -1) {
          selectedItemsList.splice(index, 1);
        }
      }
    }
  }
})();
