/**
 * translateIf Filter
 * @namespace translateIf
 * @memberOf LinShare.components
 */
(function() {
  'use strict';
  angular
    .module('linshare.components')
    .filter('translateIf', translateIfFilter);

  translateIfFilter.$inject = ['$filter'];

  /**
   * @namespace translateIfFilter
   * @desc Translate string if canTranslate is true
   * @returns {string} Value translated
   * @memberOf LinShare.components
   */
  function translateIfFilter($filter) {
    /**
     * @namespace translateIf
     * @desc If canTranslate is true, string is translated
     * @param {string} value - String to translate
     * @param {boolean} canTranslate - Can translate
     * @returns {string} String to display in view (translated if canTranslate true)
     * @memberOf LinShare.components.translateIfFilter
     */
    function translateIf(value, canTranslate) {
      return canTranslate ? $filter('translate')(value) : value;
    }

    return translateIf;
  }
})();
