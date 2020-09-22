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
      checkWidthIsBiggerThanMobile: checkWidthIsBiggerThanMobile,
      checkAndSetNewWidthSidebarRight: checkAndSetNewWidthSidebarRight
    };

    return service;
    ////////////

    /**
     *  @name checkAndSetNewWidth
     *  @desc Check and set a new width
     *  @return {Boolean}
     *  @memberof linshareUiUserApp.checkTableHeightService
     */
    function checkAndSetNewWidth() {
      var widthWindow = angular.element(window).width();

      
      return widthWindow > 1093 ? true : false;
    }

    /**
     *  @name checkWidthIsBiggerThanMobile
     *  @desc Check width is bigger than mobile
     *  @return {Boolean}
     *  @memberof linshareUiUserApp.checkTableHeightService
     */
    function checkWidthIsBiggerThanMobile() {
      var widthWindow = angular.element(window).width();

      
      return widthWindow > $rootScope.mobileWidthBreakpoint ? true : false;
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
