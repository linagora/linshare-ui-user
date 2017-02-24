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
      var heightWindow = angular.element(window).outerHeight();
      var navbarHeight = angular.element('#header').outerHeight();
      var breadcrumbHeight = angular.element('#breadcrumb-wrap').outerHeight();
      var theadHeight = angular.element('.table thead').outerHeight();
      var paginationTableHeight = angular.element('.ng-table-pager').outerHeight();
      var marginHeight = navbarHeight + breadcrumbHeight + theadHeight + paginationTableHeight;
      var tableHeight = heightWindow - marginHeight - 2;
      angular.element('#file-list-table tbody').attr('style','max-height : '+ tableHeight + 'px');
      /*  TODO: KLE put css changes into a directive */
      angular.element('#fixed-activity-table-height tbody').attr('style','max-height : '+ tableHeight + 'px ; min-height :' + tableHeight + 'px');
    }
  }
})();
