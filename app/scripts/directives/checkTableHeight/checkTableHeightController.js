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
    checkTableHeightVm.checkWidthIsBiggerThanMobile = checkTableHeightService.checkWidthIsBiggerThanMobile;
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
      var copyrightFooter = angular.element('#copyright-footer').outerHeight();
      var marginHeight = navbarHeight + breadcrumbHeight + theadHeight + paginationTableHeight + copyrightFooter;
      var tableHeight = heightWindow - marginHeight - 2;

      /*  TODO: KLE put css changes into a directive */

      /* the remaining space is assigned to the maximum height of the tbody of the current page.
      In this case it is applied to any responsive table with a #file-list-table id, more specifically: it triggers the
      only tbody located on the page to which the tr tag (withholding the checkTableHeight directive ) was assigned to*/
      /* PS: for table elements the directive is assigned to a tr element since we do not have access to the tbody
      element with ngTable */
      angular.element('#file-list-table tbody').attr('style','max-height : '+ tableHeight + 'px');

      /* the remaining space is assigned to the maximum height of the tbody of the current page.
       In this case it is applied to any non-reponsive table with a .fixed-activity-table-height id such as the one
       encountered within the activity logs page, more specifically:  it triggers the
       only tbody located on the page to which the tr tag (withholding the checkTableHeight directive) was assigned to*/
      /* PS : for table elements the directive is assigned to a tr element since we do not have access to the
       * tbody element
      with ngTable */
      /* PS :  In the following case; as a last resort I assigned a min height value as well, since there is a
       bug on the table display upon refreshing the page */
      angular.element('.fixed-activity-table-height tbody')
        .attr('style','max-height : '+ tableHeight + 'px ; min-height :' + tableHeight + 'px');


      /* the remaining space is assigned to the maximum height of the background areas of a table such as the
       * drag n drops
       and also the background images of the tables of the current page.
       PS : In this case it is applied to any .drag-n-drop-height class upon which the directive was directly
       assigned to*/
      var dndHeight = heightWindow - (navbarHeight + breadcrumbHeight + copyrightFooter) - 2;
      angular.element('.drag-n-drop-height').attr('style','height : '+ dndHeight + 'px');
    }
  }
})();
