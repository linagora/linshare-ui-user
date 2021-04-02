/**
 * toastController Controller
 * @namespace linshare.components
 */
angular
  .module('linshare.components')
  .controller('toastController', toastController);

toastController.$inject = ['_', '$timeout', '$scope'];

/**
 * @namespace toastController
 * @desc Controller for the mdToast
 * @memberOf linshare.components.toastController
 */
function toastController(_, $timeout, $scope) {
  const toastVm = this;
  let hideIntervalReference;

  toastVm.updateHideDelay = updateHideDelay;
  toastVm.$onInit = $onInit;

  ////////////////

  /**
   * @name activate
   * @desc Activation function of the controller launch at every instantiation
   * @memberOf LinShare.components.toastController
   */
  function $onInit() {
    toastVm._ = _;
    _.extend(toastVm.scope, toastVm.locals);

    updateHideDelay(toastVm.delay);

    $scope.$on('$destroy', function() {
      /* Ensure that an unbind toast didn't correctly disappear */
      angular.element('md-toast').remove();
      $timeout.cancel(hideIntervalReference);
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

    if (hideIntervalReference) {
      $timeout.cancel(hideIntervalReference);
    }

    hideIntervalReference = $timeout(function() {
      toastVm.toastClose();
    }, delay) ;
  }
}
