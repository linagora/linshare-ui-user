/**
 * materialAdminController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('materialAdminController', materialAdminController);

  materialAdminController.$inject = ['$state'];

  /**
   * @namespace materialAdminController
   * @desc Manage Material Admin's controller
   * @memberOf linshareUiUserApp
   */
  function materialAdminController($state) {
    /* jshint validthis: true */
    var materialAdminVm = this;

    // For Mainmenu Active Class
    materialAdminVm.$state = $state;
    // By default template has a boxed layout
    materialAdminVm.layoutType = localStorage.getItem('ma-layout-status');
    //Listview Search (Check listview pages)
    materialAdminVm.listviewSearchStat = false;
    //Listview menu toggle in small screens
    materialAdminVm.lvMenuStat = false;
    // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
    materialAdminVm.sidebarToggle = {
      left: true,
      right: false
    };

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshareUiUserApp.materialAdminController
     */
    function activate() {
      detectMobileBrowser();
    }

    /**
     * @name detectMobileBrowser
     * @desc Detect mobile browser to set app in mobile mode
     * @memberOf linshareUiUserApp.materialAdminController
     */
    function detectMobileBrowser() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        angular.element('html').addClass('ismobile');
      }
    }
  }
})();
