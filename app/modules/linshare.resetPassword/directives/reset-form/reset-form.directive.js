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
      templateUrl: templateUrlFunc,
      controller: 'ResetFormController',
      controllerAs: 'resetFormVm',
      bindToController: true,
    };

    return directive;

    ////////////

    /**
     *  @namespace templateUrlFunc
     *  @desc TemplateUrl function of sidebarContent Directive
     *  @param {Object} elem - jqLite-wrapped element that this directive matches
     *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
     *  @memberOf LinShare.resetPassword.lsResetForm
     */
    function templateUrlFunc(elem, attrs) {
      return 'modules/linshare.resetPassword/directives/reset-form/reset-form-' + attrs.resetType + '.html';
    }
  }
})();
