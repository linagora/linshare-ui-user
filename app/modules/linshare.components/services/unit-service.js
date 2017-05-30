/**
 * unitService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('unitService', unitService);

  unitService.$inject = ['_'];

  function unitService(_) {
    var units = {
      B: {
        value: 'B',
        factor: 0
      },
      KB: {
        value: 'KB',
        factor: 3
      },
      MB: {
        value: 'MB',
        factor: 6
      },
      GB: {
        value: 'GB',
        factor: 9
      },
      TB: {
        value: 'TB',
        factor: 12
      },
      PB: {
        value: 'PB',
        factor: 15
      },
      EB: {
        value: 'EB',
        factor: 18
      },
      ZB: {
        value: 'ZB',
        factor: 21
      },
      YB: {
        value: 'YB',
        factor: 24
      }
    };
    var service = {
      byteTo: byteTo,
      find: find,
      toByte: toByte,
      units: units
    };

    return service;

    ////////////

    /**
     * @name byteTo
     * @desc Convert a bit number to a defined unit in Byte
     * @param {string} value - Value to convert
     * @param {string} selectedUnit - Unit to use if setted
     * @param {boolean} showUnit - Determine if unit should be return with the value
     * @returns {int} Value converted to requested unit
     * @memberOf linshare.components.unitService
     */
    function byteTo(value, selectedUnit, showUnit) {
      var result = 0;
      if (_.isUndefined(value) || value === null || isNaN(value)) {
        return result;
      }
      var unit = _.isUndefined(selectedUnit) ? find(value) : selectedUnit;
      result = value / Math.pow(10, units[unit].factor);
      result = (result % 1 === 0) ? result : result.toFixed(2);
      return showUnit ? result + ' ' + unit : result;
    }

    /**
     * @name find
     * @desc Set the most apropriate unit for the value given
     * @param {string} value - A value
     * @returns {string} The most apropriate unit
     * @memberOf linshare.components.unitService
     */
    function find(value) {
      switch (value.toString().length) {
        case 1:
        case 2:
        case 3:
          return units.B.value;
        case 4:
        case 5:
        case 6:
          return units.KB.value;
        case 7:
        case 8:
        case 9:
          return units.MB.value;
        case 10:
        case 11:
        case 12:
          return units.GB.value;
        case 13:
        case 14:
        case 15:
          return units.TB.value;
        case 16:
        case 17:
        case 18:
          return units.PB.value;
        case 19:
        case 20:
        case 21:
          return units.EB.value;
        case 22:
        case 23:
        case 24:
          return units.ZB.value;
        default:
          return units.YB.value;
      }
    }

    /**
     * @name toByte
     * @desc Convert a number with a defined unit to a Byte number
     * @param {string} value - Value to convert
     * @param {string} unit - Unit of the value
     * @returns {int} Value converted to requested unit
     * @memberOf linshare.components.uniteService
     */
    function toByte(value, unit, showUnit) {
      var result = 0;
      if (_.isUndefined(value) || value === null || isNaN(value)) {
        return result;
      }
      result = value * Math.pow(10, units[unit].factor);
      result = (result % 1 === 0) ? result : result.toFixed(2);
      return showUnit ? result + units.B : result;
    }
  }
})();
