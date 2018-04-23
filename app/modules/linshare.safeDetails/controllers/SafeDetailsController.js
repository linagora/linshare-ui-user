/**
 * safeDetailsController Controller
 * @namespace Audit
 * @memberOf linshare.safeDetails
 */
(function () {
  'use strict';

  angular
    .module('linshare.safeDetails')
    .controller(
      'SafeDetailsController',
      SafeDetailsController
    );

  SafeDetailsController.$inject = [
    '$translatePartialLoader',
    'safeDetailsRestService',
    'tableParamsService'
  ];

  /**
   * @namespace safeDetailsController
   * @desc Application safeDetails management system controller
   * @memberOf linshare.safeDetails
   */
  function SafeDetailsController(
    $translatePartialLoader,
    safeDetailsRestService,
    tableParamsService
  ) {
    /* jshint validthis: true */
    var safeDetailsVm = this;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshare.safeDetails.safeDetailsController
     */
    function activate() {
      $translatePartialLoader.addPart('safeDetails');

      safeDetailsRestService.getList().then(function (safeDetailsList) {
        launchTableParamsInitiation(safeDetailsList);
      });
    }

    /**
     * @name launchTableParamsInitiation
     * @desc Initialize tableParams and related functions
     * @param safeDetailsList - Array<object> - List of all safe details
     * @memberOf linshare.safeDetails.safeDetailsController
     */
    function launchTableParamsInitiation(safeDetailsList) {
      tableParamsService.initTableParams(safeDetailsList);
      safeDetailsVm.tableParams = tableParamsService.getTableParams();
    }
  }
})();
