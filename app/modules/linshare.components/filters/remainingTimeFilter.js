/**
 * remainingTime Filter
 * @namespace remainingTime
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('remainingTime', remainingTimeFilter);

  /**
   * @namespace remainingTimeFilter
   * @desc filter of all variables and methods for remaining time filter
   * @returns {string} Value to show in view
   * @memberOf LinShare.components
   */
  function remainingTimeFilter() {
    const NB_SECONDS_IN_DAY = 3600 * 24,
      NB_SECONDS_IN_HOUR = 3600,
      NB_SECONDS_IN_MIN = 60;

    /**
     * @namespace secToHour
     * @desc convert seconds to hour
     * @param {number} seconds - variable given in filter
     * @returns {string} converted value to custom time string
     * @memberOf LinShare.components.remainingTimeFilter
     */
    function secToHour(seconds) {
      return parseInt(seconds/NB_SECONDS_IN_HOUR)  + ' h' +
        parseInt((parseFloat(seconds/NB_SECONDS_IN_HOUR) - parseInt(seconds/NB_SECONDS_IN_HOUR)) * 60) + ' min';
    }

    /**
     * @namespace secToMin
     * @desc convert seconds to minutes
     * @param {number} seconds - variable given in filter
     * @memberOf LinShare.components.remainingTimeFilter
     */
    function secToMin(seconds) {
      return parseInt(seconds/NB_SECONDS_IN_MIN) + ' min' +
        Math.round((parseFloat(seconds/NB_SECONDS_IN_MIN) - parseInt(seconds/NB_SECONDS_IN_MIN)) * 60) + ' s';
    }

    /**
     * @namespace remainingTimeToShow
     * @desc concatenate all variables to show the remaining time of an upload
     * @param {number} seconds - variable given in filter
     * @returns {string} Value to show in view
     * @memberOf LinShare.components.remainingTimeFilter
     */
    function remainingTimeToShow(seconds) {
      if (!Number.isFinite(seconds)) {
        return '-';
      }

      if (seconds < NB_SECONDS_IN_MIN) {
        return Math.round(seconds) + ' s';
      } else if (NB_SECONDS_IN_MIN <= seconds < NB_SECONDS_IN_HOUR) {
        return secToMin(seconds);
      } else if (NB_SECONDS_IN_HOUR <= seconds < NB_SECONDS_IN_DAY) {
        return secToHour(seconds);
      }
    }

    return remainingTimeToShow;
  }
})();
