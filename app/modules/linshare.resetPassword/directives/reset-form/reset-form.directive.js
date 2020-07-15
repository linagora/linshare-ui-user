/**
 * lsResetForm Directive
 * @namespace LinShare.resetPassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.resetPassword')
    .directive('lsResetForm', lsResetForm);

  lsResetForm.$inject = [];

  /**
   *  @namespace lsResetForm
   *  @desc Directive to manage form of reset password depending on type of reset state
   *  @example <div ls-reset-form x-reset-type="" x-reset-action=""></div>
   *  @memberOf LinShare.resetPassword
   */
  function lsResetForm() {
    var directive = {
      restrict: 'A',
      scope: {
        resetAction: '&',
        resetData: '=',
        resetType: '@'
      },
      template,
      controller: 'ResetFormController',
      controllerAs: 'resetFormVm',
      bindToController: true,
    };

    return directive;

    ////////////

    /**
     *  @namespace template
     *  @desc template function of sidebarContent Directive
     *  @param {Object} elem - jqLite-wrapped element that this directive matches
     *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
     *  @memberOf LinShare.resetPassword.lsResetForm
     */
    function template(elem, attrs) {
      const resetForms = {
        create: require('./reset-form-create.html'),
        finalize: require('./reset-form-finalize.html'),
        forgot: require('./reset-form-forgot.html'),
        reinitialize: require('./reset-form-reinitialize.html'),
        update: require('./reset-form-update.html')
      }

      return resetForms[attrs.resetType];
    }
  }
})();
