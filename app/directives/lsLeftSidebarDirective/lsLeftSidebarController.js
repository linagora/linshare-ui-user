/**
 * lsLeftSidebarController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('lsLeftSidebarController', lsLeftSidebarController);

  lsLeftSidebarController.$inject = ['$timeout', 'MenuService'];

  /**
   * @namespace lsLeftSidebarController
   * @desc Manage left sidebar's controller
   * @memberOf linshareUiUserApp
   */
  function lsLeftSidebarController($timeout, MenuService) {
    /* jshint validthis: true */
    var lsLeftSidebarVm = this;
    lsLeftSidebarVm.$timeout = $timeout;
    lsLeftSidebarVm.changeColor = changeColor;
    lsLeftSidebarVm.tabs = {};

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshareUiUserApp.lsLeftSidebarController
     */
    function activate() {
      lsLeftSidebarVm.tabs = MenuService.getAvailableTabs();
    }

    /**
     * @name changeColor
     * @desc Change color of mouse hovered menu
     * @param {Object} link - tab details
     * @param {String} color - color to apply
     * @memberOf linshareUiUserApp.lsLeftSidebarController
     */
    function changeColor(link, color) {
      if(link.disabled === false) {
        lsLeftSidebarVm.customColor = {'color': color};
      }
    }
  }
})();
