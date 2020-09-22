/**
 * FilterBoxController Controller
 * @namespace linshare.component
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('FilterBoxController', FilterBoxController);

  FilterBoxController.$inject = [
    '_', '$scope', '$timeout', 'autocompleteUserRestService', 'filterBoxService', 'moment', 'unitService'
  ];

  /**
   * @namespace FilterBoxController
   * @desc Controller of the filtering component
   * @memberOf linshare.components
   */
  function FilterBoxController(_, $scope, $timeout, autocompleteUserRestService, filterBoxService, moment,
    unitService) {
    var filterBoxVm = this;

    filterBoxVm.$onInit = $onInit;

    function $onInit() {
      filterBoxVm.autocompleteUserRestService = autocompleteUserRestService;
      filterBoxVm.clearParams = clearParams;
      filterBoxVm.filterBoxItems = filterBoxService.getSetItems;
      filterBoxService.getSetItems(filterBoxVm.filterItems);
      filterBoxVm.filterBoxTable = filterBoxService.getSetTable;
      filterBoxService.getSetTable(filterBoxVm.filterTable);
      filterBoxVm.formatLabel = formatLabel;
      filterBoxVm.maxDate = moment().add(1, 'day').hours(23).minutes(59).seconds(59);
      filterBoxVm.reloadTable = filterBoxService.reloadTable;
      filterBoxVm.resetTableList = filterBoxService.resetTableList;
      filterBoxVm.showDateRange = filterBoxService.getSetDateFilter;
      filterBoxVm.showRecipients = filterBoxService.getSetRecipientsFilter;
      filterBoxVm.showUnit = filterBoxService.getSetUnitFilter;
      filterBoxVm.unitService = unitService;
      filterBoxVm.updateFilters = updateFilters;
      filterBoxVm.userRepresentation = userRepresentation;
    }

    ////////////

    /**
     * @name clearParams
     * @desc Remove filter element
     * @memberOf linshare.components.FilterBoxController
     */
    function clearParams() {
      filterBoxVm.sizeStart = undefined;
      filterBoxVm.sizeEnd = undefined;
      filterBoxVm.dateStart = undefined;
      filterBoxVm.dateEnd = undefined;
      filterBoxVm.selectedContact = undefined;
      filterBoxVm.resetTableList();
      delete filterBoxVm.filterBoxTable().filter().sender;
      filterBoxVm.reloadTable();
    }

    /**
     * @name dateFilter
     * @desc Get filter date value
     * @returns {Object} date start & end
     * @memberOf linshare.components.FilterBoxController
     */
    function dateFilter() {
      if (filterBoxVm.showDateRange()) {
        var dateStart = filterBoxVm.dateStart ?
          moment(filterBoxVm.dateStart) : moment('0000-01-01');
        var dateEnd = filterBoxVm.dateEnd ?
          moment(filterBoxVm.dateEnd).add('day', +1) : moment().add('day', +1);

        
        return {dateStart: dateStart, dateEnd: dateEnd};
      }
    }

    /**
     * @name formatLabel
     * @desc Format representation of object user
     * @param {string} user - Object containing user information
     * @returns {string} Concatenation of string 'firstName' and 'lastName'
     * @memberOf linshare.components.FilterBoxController
     */
    function formatLabel(user) {
      if (!_.isUndefined(user)) {
        if (user.firstName !== '') {
          return user.firstName.concat(' ', user.lastName);
        }
      }
    }

    /**
     * @name sizeFilter
     * @desc Get filter size value
     * @returns {Object} size start & end
     * @memberOf linshare.components.FilterBoxController
     */
    function sizeFilter() {
      if (filterBoxVm.showUnit()) {
        var sizeStart = filterBoxVm.sizeStart ?
          filterBoxVm.unitService.toByte(filterBoxVm.sizeStart, filterBoxVm.unitSize.value, false) : 0;
        var sizeEnd = filterBoxVm.sizeEnd ?
          filterBoxVm.unitService.toByte(filterBoxVm.sizeEnd, filterBoxVm.unitSize.value, false) : 999999999999;

        
        return {sizeStart: sizeStart, sizeEnd: sizeEnd};
      }
    }

    /**
     * @name updateFilters
     * @desc Update the filters to apply to the list of element in the table
     * @memberOf linshare.components.FilterBoxController
     */
    function updateFilters() {
      filterBoxVm.resetTableList();
      var dateValues = dateFilter();
      var sizeValues = sizeFilter();

      _.remove(filterBoxVm.filterItems, function(item) {
        var
          sizeIsValid = true,
          dateIsValid = true;

        if (filterBoxVm.showUnit()) {
          if (_.isUndefined(item.size)) {
            sizeIsValid = false;
          } else {
            var size = item.size.toFixed(1);

            sizeIsValid = (size >= sizeValues.sizeStart && size <= sizeValues.sizeEnd);
          }
        }
        if (filterBoxVm.showDateRange()) {
          var date = filterBoxVm.dateType === '1' ? item.modificationDate : item.creationDate;

          dateIsValid = (date >= dateValues.dateStart && date <= dateValues.dateEnd);
        }
        
        return !(sizeIsValid && dateIsValid);
      });

      if (filterBoxVm.showRecipients() && !_.isUndefined(filterBoxVm.selectedContact)) {
        _.extend(filterBoxVm.filterBoxTable().filter(), {
          sender: {
            firstName: filterBoxVm.selectedContact.firstName,
            lastName: filterBoxVm.selectedContact.lastName,
            mail: filterBoxVm.selectedContact.mail
          }
        });
      } else {
        delete filterBoxVm.filterBoxTable().filter().sender;
      }
      filterBoxVm.reloadTable();
    }

    /**
     * @name UserRepresentation
     * @desc Format the reprensation of a user in the sender field
     * @param {string} user - Object containing user information
     * @returns {string} Formatted reprensation of the user
     * @memberOf linshare.components.FilterBoxController
     */
    function userRepresentation(user) {
      if (_.isString(user)) {
        return user;
      }
      if (_.isObject(user)) {
        return '<span>' + user.firstName + ' ' + user.lastName + '</span> <span >' +
          ' <i class="zmdi zmdi-email"></i> &nbsp;' + user.mail + '</span>';
      }
    }
  }
})();
