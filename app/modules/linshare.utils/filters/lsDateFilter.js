/**
 * linshareDate Filter
 * @namespace linshareDate
 * @memberOf LinShare.utils
 */
(function() {
  'use strict';
  angular
    .module('linshare.utils')
    .filter('lsDate', linshareDateFilter);

  linshareDateFilter.$inject = [
    'moment'
  ];

  /**
   * @namespace linshareDateFilter
   * @desc Format date applying specified format and local via moment
   * @memberOf LinShare.utils
   */
  function linshareDateFilter(
    moment
  ) {
    /**
     * @namespace linshareDate
     * @desc Format date applying specified format and local via moment
     * @param {string} date - date to be formatted
     * @param {string} format - the date format to applied
     * @returns {string} Date formatted
     * @memberOf LinShare.utils.linshareDateFilter
     */
    function linshareDate(date, format, language) {
      if (language) {
        moment.locale(language.key);
      }

      const dateFormat = {
        shortDate: 'l',
        medium: 'lll',
        mediumDate: 'll',
        longDate: 'LL',
        fullDate: 'LLL',
      };

      return moment(date)
        .format(dateFormat[format] || format);
    }

    return linshareDate;
  }
})();
