/**
 * CheckTableHeightController Controller
 * @namespace linshareUiUserApp
 */
(function(){
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('CheckTableHeightController', CheckTableHeightController);

  CheckTableHeightController.$inject = ['$scope', 'checkTableHeightService'];

  /**
   * @namespace CheckTableHeightController
   * @desc Controller of the directive check-table-height
   * @memberof LinShare.components
   */
  function CheckTableHeightController($scope, checkTableHeightService) {

    /* jshint validthis:true */
    var checkTableHeightVm = this;
    checkTableHeightVm.checkAndSetNewWidth = checkTableHeightService.checkAndSetNewWidth;
    checkTableHeightVm.checkAndSetNewWidthSidebarRight = checkTableHeightService.checkAndSetNewWidthSidebarRight;
    checkTableHeightVm.resizeTableBody = resizeTableBody;

    /**
     *  @name resizeTableBody
     *  @desc Check the height window and resize this height
     *  @memberof LinShare.components.CheckTableHeightController
     */
    function resizeTableBody() {
      var heightWindow = angular.element(window).height();
      var tableHeight = heightWindow - 243;
      angular.element('#file-list-table tbody').attr('style','max-height : '+ tableHeight + 'px');
    }
  }
})();
