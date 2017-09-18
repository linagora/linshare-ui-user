/**
 * filterBox directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('filterBox', filterBox);

  filterBox.$inject = ['componentsConfig'];

  /**
   * @namespace filterBox
   * @desc Component for filter & search inside an ngTable
   * @example <filter-box filter-box-date="true" filter-box-size-="true" filter-box-user="true"
   *                      filter-box-items="itemsList" filter-box-reload="tableParams.reload()">
   *          <filter-box>
   * @memberOf linshare.components
   */
  function filterBox(componentsConfig) {
    var directive = {
      restrict: 'E',
      scope: {
        filterBoxDate: '@?',
        filterBoxSize: '@?',
        filterBoxUser: '@?'
      },
      controller: 'FilterBoxController',
      controllerAs: 'filterBoxVm',
      bindToController: {
        filterItems: '=filterBoxItems',
        filterTable: '=filterBoxTable'
      },
      templateUrl: componentsConfig.path + 'filterBox/filterBoxTemplate.html'
    };

    return directive;
  }
})();
