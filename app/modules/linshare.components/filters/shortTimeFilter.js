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

  shortTimeFilter.$inject = ['$translate'];

  /**
   * @namespace shortTimeFilter
   * @desc filter of all variables and methods for short time filter
   * @returns {string} Value to show in view
   * @memberOf LinShare.components
   */
  function shortTimeFilter($translate) {
    // TODO : service where to set moment lang
    var local = $translate.use().substring(0, $translate.use().indexOf('-'));
    moment.locale(local);

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
