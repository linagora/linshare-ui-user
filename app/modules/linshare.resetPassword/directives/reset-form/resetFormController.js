/**
 * ResetFormController Controller
 * @namespace LinShare.resetPassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.resetPassword')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('resetPassword');
    }])
    .controller('ResetFormController', ResetFormController);

  ResetFormController.$inject = ['_', 'languageService', 'lsAppConfig'];

  function ResetFormController(_, languageService, lsAppConfig) {
    var resetFormVm = this;

    resetFormVm.$onInit = $onInit;

    function $onInit() {
      resetFormVm.getFormData = getFormData;
      resetFormVm.languageService = languageService;
      resetFormVm.resetSubmit = resetSubmit;
      resetFormVm.resetPasswordUrl = lsAppConfig.resetPasswordUrl;
      resetFormVm.message = {
        key: 'RESET.FORM.INFO.' + resetFormVm.resetType.toUpperCase(),
        params: resetFormVm.resetData
      };
    }

    ////////////

    /**
     *  @name getFormData
     *  @desc Fill an object with form data
     *  @returns {Object} An object containing form data
     *  @memberOf LinShare.resetPassword.ResetFormController
     */
    function getFormData() {
      var data;

      if (_.isUndefined(resetFormVm.resetData)) {
        data = {
          email: resetFormVm.email,
          password: resetFormVm.password,
          passwordBis: resetFormVm.passwordBis
        };
      } else {
        data = resetFormVm.resetData;
        data.password = resetFormVm.password;
      }

      return data;
    }

    /**
     *  @name resetSubmit
     *  @desc Submit action of form Reset password
     *  @memberOf LinShare.resetPassword.ResetFormController
     */
    function resetSubmit() {
      if (resetFormVm.password === resetFormVm.passwordBis) {
        resetFormVm.resetAction({
          formData: resetFormVm.getFormData()
        }).then(function(data) {
          resetFormVm.message = {
            key: 'RESET.FORM.INFO.' + resetFormVm.resetType.toUpperCase(),
            params: data
          };
        });
      }
    }
  }
})();
