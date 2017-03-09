/**
 * toastController Controller
 * @namespace linshare.components
 */
(function(){
  'use strict';

  angular
    .module('linshare.components')
    .controller('toastController', toastController);

  /**
   * @namespace toastController
   * @desc Controller for the mdToast
   * @memberOf linshare.components.toastController
   */
  function toastController() {
    /* jshint validthis:true */
    var toastVm = this;
    _.extend(toastVm.scope, toastVm.locals);
  }
})();
