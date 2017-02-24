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

  relativeTimeFilter.$inject = ['$translate'];

  /**
   * @namespace relativeTimeFilter
   * @desc filter of all variables and methods for relative time filter
   * @returns {string} Value to show in view
   * @memberOf LinShare.components
   */
  function relativeTimeFilter($translate) {
    // TODO : service where to set moment lang
    var local = $translate.use().substring(0, $translate.use().indexOf('-'));
    moment.locale(local);

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

    return relativeTimeToShow;
  }
})();
