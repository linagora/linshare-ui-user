/**
 * calendarTime Filter
 * @namespace calendarTime
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('calendarTime', calendarTimeFilter);

  calendarTimeFilter.$inject = ['moment'];

  /**
   * @namespace calendarTimeFilter
   * @desc filter of all variables and methods for calendar time filter
   * @returns {string} Value to show in view
   * @memberOf LinShare.components
   */
  function calendarTimeFilter(moment) {
    /**
     * @namespace calendarTimeToShow
     * @desc convert millis variable to calendar time
     * @param {number} seconds - variable given in filter
     * @returns {string} Converted date to show in view
     * @memberOf LinShare.components.calendarTimeFilter
     */
    function calendarTimeToShow(seconds) {
      return moment(seconds).format('LLLL');
    }

    return calendarTimeToShow;
  }
})();
