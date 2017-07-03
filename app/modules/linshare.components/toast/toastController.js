/**
 * toastController Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('toastController', toastController);

  toastController.$inject = ['_', '$interval', '$scope'];

  /**
   * @namespace toastController
   * @desc Controller for the mdToast
   * @memberOf linshare.components.toastController
   */
  function toastController(_, $interval, $scope) {
    /* jshint validthis:true */
    var toastVm = this;
    toastVm.updateHideDelay = updateHideDelay;

    activate();

    ////////////////

    /**
     * @name activate
     * @desc Activation function of the controller launch at every instantiation
     * @memberOf LinShare.components.toastController
     */
    function activate() {
      toastVm._ = _;
      _.extend(toastVm.scope, toastVm.locals);

      updateHideDelay(toastVm.delay);

      $scope.$on('$destroy', function() {
        /* Ensure that an unbind toast didn't correctly disappear */
        angular.element('md-toast').remove();
        $interval.cancel(toastVm.hideInterval);
      });
    }

    /**
     * @name updateHideDelay
     * @desc Update the hide delay of the current toast
     * @param {number} delay - Delay to set for the toast hideDelay
     * @memberOf LinShare.components.toastController
     */
    function updateHideDelay(delay) {
      delay = delay || 120000;

      if (toastVm.hideInterval) {
        $interval.cancel(toastVm.hideInterval);
      }
      toastVm.hideInterval = $interval(function() {
        toastVm.toastClose();
      }, delay, 1) ;
    }
  }
})();
