/**
 * lsErrorCode Constant
 * @namespace linshareUiUserApp
 */
(function(){
  'use strict';

  /**
   * This file is an enumerator of the error code managed by the APP
   * The error code below 1000 are front end specific and above back end specific
   */
  angular
    .module('linshareUiUserApp')
    .constant('lsErrorCode', {
      CANCELLED_BY_USER: 100
    });
})();
