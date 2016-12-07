/**
 * checkTableHeightService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('checkTableHeightService', checkTableHeightService);

  checkTableHeightService.$inject = ['$rootScope'];

  /**
   *  @namespace checkTableHeightService
   *  @desc Service to check the window height
   *  @memberOf linshareUiUserApp
   */
  function checkTableHeightService($rootScope) {
    var service = {
      checkAndSetNewWidth: checkAndSetNewWidth,
      checkAndSetNewWidthSidebarRight: checkAndSetNewWidthSidebarRight
    };

    return service;
    ////////////

    /**
     *  @name checkAndSetNewWidth
     *  @desc Check and set a new width
     *  @param {Boolean} element
     *  @memberof linshareUiUserApp.checkTableHeightService
     */
    function checkAndSetNewWidth(element) {
      var widthWindow = angular.element(window).width();
      element = widthWindow > 1093 ? true : false;
    }

    /*TODO: class name in hyphen*/
    /**
     *  @name checkAndSetNewWidthSidebarRight
     *  @desc Check and set a new width for the side bar
     *  @memberof linshareUiUserApp.checkTableHeightService
     */
    //TODO : To be hyphenized -> setSidebarRightMobileState
    function checkAndSetNewWidthSidebarRight() {
      var widthWindow = angular.element(window).width();
      if (widthWindow < $rootScope.mobileWidthBreakpoint) {
        angular.element('aside#chat.sidebar-right').appendTo('body');
        angular.element('aside#chat.sidebar-right').addClass('setSidebarRightMobileState');
      } else {
        angular.element('aside#chat.sidebar-right').removeClass('setSidebarRightMobileState');
      }
    }
  }
})();
