/**
 * toastController Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('toastController', toastController);

  toastController.$inject = ['_', '$scope'];

  /**
   * @namespace toastController
   * @desc Controller for the mdToast
   * @memberOf linshare.components.toastController
   */
  function toastController(_, $scope) {
    /* jshint validthis:true */
    var toastVm = this;

    activate();

    ////////////////

    /**
     * @namespace activate
     * @desc Activation function of the controller launch at every instantiation
     * @memberOf LinShare.components.toastController
     */
    function activate() {
      toastVm._ = _;
      _.extend(toastVm.scope, toastVm.locals);
      $scope.$on('$destroy', function() {
        /* Ensure that an unbind toast didn't correctly disapear */
        angular.element('md-toast').remove();
      });
    }
  }
})();
