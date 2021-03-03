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
      convertBase,
      formatUnit,
      setAppropriateSize,
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
      result = (result % 1 === 0) ? result : Number(result.toFixed(2));

      return showUnit ? result + ' ' + unit : result;
    }

    /**
     * @name find
     * @desc Set the most apropriate unit for the value given
     * @param {string} value - A value
     * @returns {string} The most apropriate unit
     * @memberOf linshare.components.unitService
     */
    function find(value, options) {
      const { upperbound, lowerbound } = options;

      var
        length = value.toString().length,
        unit,
        multiple3 = {
          1: 3,
          2: 3,
          4: 6,
          5: 6,
          7: 9,
          8: 9,
          10: 12,
          11: 12,
          13: 15,
          14: 15,
          16: 18,
          17: 18,
          19: 21,
          20: 21,
          22: 24,
          23: 24,
        },
        size = {
          3: units.B,
          6: units.KB,
          9: units.MB,
          12: units.GB,
          15: units.TB,
          18: units.PB,
          21: units.EB,
          24: units.ZB
        };

      if (multiple3.hasOwnProperty(length)) {
        length = multiple3[length];
      }

      if (size.hasOwnProperty(length)) {
        unit = size[length];

        let upperboundLimit = 24, lowerboundLimit = 9;

        Object.keys(size).map(item => {
          if (size[item].value === upperbound) {
            upperboundLimit = item;
          }
          if (size[item].value === lowerbound) {
            lowerboundLimit = item;
          }
        });

        while (length > lowerboundLimit) {
          const convertedValue = Number(byteTo(value, unit.value));

          if (convertedValue * Math.pow(10, unit.factor) !== value || length > upperboundLimit) {
            length -= 3;
            unit = size[length];
          } else {
            break;
          }
        };

        return unit.value;

      } else {
        return units.YB.value;
      }
    }

    /**
     * @name toByte
     * @desc Convert a number with a defined unit to a Byte number
     * @param {string} value - Value to convert
     * @param {string} unit - Unit of the value
     * @param {boolean} showUnit - Determine if the unit should be displayed with the value
     * @returns {int} Value converted to requested unit
     * @memberOf linshare.components.uniteService
     */
    function toByte(value, unit, showUnit) {
      if (_.isUndefined(value) || value === null || isNaN(value)) {
        return value;
      }

      let result;

      result = value * Math.pow(10, units[unit].factor);
      result = (result % 1 === 0) ? result : result.toFixed(2);

      return showUnit ? result + units.B : result;
    }

    function convertBase (currentUnit, configUnit) {
      const mapping = {
        'KILO': 1,
        'KB': 1,
        'MEGA': 1000,
        'MB': 1000,
        'GIGA': 1000000,
        'GB': 1000000
      };

      return mapping[configUnit] / mapping[currentUnit];
    }

    function formatUnit(unit) {
      switch (unit) {
        case 'KILO':
          return 'KB';
        case 'KB':
          return 'KB';
        case 'MEGA':
          return 'MB';
        case 'MB':
          return 'MB';
        case 'GIGA':
          return 'GB';
        case 'GB':
          return 'GB';
        case 'Bytes':
          return 'B';
        case 'B':
          return 'B';
        default:
          return 'MB';
      }
    }

    function setAppropriateSize(value) {
      if (!value) {
        return;
      }
      const appropriateUnit = find(value, { upperbound: 'GB', lowerbound: 'KB' });
      const convertedValue = byteTo(value, appropriateUnit);

      return {
        value: convertedValue,
        unit: appropriateUnit
      };
    }
  }
})();
