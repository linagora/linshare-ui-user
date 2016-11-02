(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('LinshareSidebar', LinshareSidebar);

  LinshareSidebar.$inject = ['$log'];

  //TODO: unused for now, move sidebar element from UiUserMainController
  function LinshareSidebar($log) {
    /*jshint unused: false */
    /* jshint validthis: true */
    var linshareSidebarVm = this;

    activate();

    function activate() {
      $log.debug('Activated LinshareSidebar View');
    }
  }
})();
