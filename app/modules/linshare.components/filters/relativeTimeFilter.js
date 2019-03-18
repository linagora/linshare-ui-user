/**
 * relativeTime Filter
 * @namespace relativeTime
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('relativeTime', relativeTimeFilter);

  relativeTimeFilter.$inject = ['moment'];

  /**
   * @namespace relativeTimeFilter
   * @desc filter of all variables and methods for relative time filter
   * @returns {string} Value to show in view
   * @memberOf LinShare.components
   */
  function relativeTimeFilter(moment) {
    /**
     * @namespace relativeTimeToShow
     * @desc convert millis variable to relative time
     * @param {number} seconds - variable given in filter
     * @returns {string} Converted date to show in view
     * @memberOf LinShare.components.relativeTimeFilter
     */
    function relativeTimeToShow(seconds) {
      return moment(seconds).fromNow();
    }

    relativeTimeToShow.$stateful = true;

    return relativeTimeToShow;
  }
})();
