/**
 * shortTime Filter
 * @namespace shortTime
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('shortTime', shortTimeFilter);

  shortTimeFilter.$inject = ['moment'];

  /**
   * @namespace shortTimeFilter
   * @desc filter of all variables and methods for short time filter
   * @returns {string} Value to show in view
   * @memberOf LinShare.components
   */
  function shortTimeFilter(moment) {
    /**
     * @namespace shortTimeToShow
     * @desc convert millis variable to relative time
     * @param {number} seconds - variable given in filter
     * @returns {string} Converted date to show in view
     * @memberOf LinShare.components.shortTimeFilter
     */
    function shortTimeToShow(seconds) {
      return moment(seconds).format('L');
    }

    return shortTimeToShow;
  }
})();
