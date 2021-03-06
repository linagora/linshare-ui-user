/**
 * lsLeftSidebarController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('lsLeftSidebarController', lsLeftSidebarController);

  lsLeftSidebarController.$inject = ['$http', '$timeout', 'authenticationRestService', 'lsAppConfig', 'MenuService', '$log'];

  /**
   * @namespace lsLeftSidebarController
   * @desc Manage left sidebar's controller
   * @memberOf linshareUiUserApp
   */
  function lsLeftSidebarController($http, $timeout, authenticationRestService, lsAppConfig, MenuService, $log) {
    /* jshint validthis: true */
    var lsLeftSidebarVm = this;

    lsLeftSidebarVm.$timeout = $timeout;
    lsLeftSidebarVm.lsAppConfig = lsAppConfig;
    lsLeftSidebarVm.productVersion = 'dev';
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
      getCoreVersion();
      getProductVersion();
    }

    /**
     * @name getCoreVersion
     * @desc Get LinShare core version
     * @memberOf linshareUiUserApp.lsLeftSidebarController
     */
    function getCoreVersion() {
      authenticationRestService.version().then(function(data) {
        lsLeftSidebarVm.coreVersion = data.version;
      });
    }

    /**
     * @name getProductVersion
     * @desc Get LinShare product version
     * @memberOf linshareUiUserApp.lsLeftSidebarController
     */
    function getProductVersion() {
      $http.get('/about.json').then(response => {
        lsLeftSidebarVm.productVersion = response && response.data && response.data.version;
      }).catch(error => {
        $log.debug(error);
      });
    }
  }
})();
