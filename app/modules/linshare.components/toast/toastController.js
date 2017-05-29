/**
 * toastController Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('toastController', toastController);

  toastController.$inject = ['_'];

  /**
   * @namespace toastController
   * @desc Controller for the mdToast
   * @memberOf linshare.components.toastController
   */
  function toastController(_) {
    /* jshint validthis:true */
    var toastVm = this;
    toastVm._ = _;
    _.extend(toastVm.scope, toastVm.locals);
  }
})();
