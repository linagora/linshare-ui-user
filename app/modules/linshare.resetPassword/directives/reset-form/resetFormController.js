/**
 * ResetFormController Controller
 * @namespace LinShare.resetPassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.resetPassword')
    .controller('ResetFormController', ResetFormController);

  ResetFormController.$inject = ['_', '$scope', '$translate', '$translatePartialLoader', 'languageService'];

  function ResetFormController(_, $scope, $translate, $translatePartialLoader, languageService) {
    /* jshint validthis:true */
    var resetFormVm = this;

    resetFormVm.getFormData = getFormData;
    resetFormVm.languageService = languageService;
    resetFormVm.resetSubmit = resetSubmit;
    resetFormVm.translateInfoMessage = translateInfoMessage;

    activate();

    ////////////

    /**
     *  @name activate
     *  @desc Activation function of the controller, launch at every instantiation
     *  @memberOf LinShare.resetPassword.ResetFormController
     */
    function activate() {
      $translatePartialLoader.addPart('resetPassword');
      $translate.refresh().then(function() {
        translateInfoMessage(resetFormVm.resetData);
      });

      $scope.$watch(function() {
        return resetFormVm.languageService.getLocale();
      }, function() {
        translateInfoMessage(resetFormVm.resetData);
      });
    }

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
          resetFormVm.translateInfoMessage(data);
        });
      }
    }

    /**
     *  @name translateInfoMessage
     *  @desc Translate the information message to be shown
     *  @param {Object} data - Variables used in the message to be translated
     *  @memberOf LinShare.resetPassword.ResetFormController
     */
    function translateInfoMessage(data) {
      $translate('RESET.FORM.INFO.' + resetFormVm.resetType.toUpperCase()).then(function(translate) {
        resetFormVm.message = translate;
        //TODO : TO be avoided/ optimised depending of number of key to be replaced
        for (var property in data) {
          if (data.hasOwnProperty(property)) {
            resetFormVm.message = resetFormVm.message.replace('${' + property + '}', data[property]);
          }
        }
      });
    }
  }
})();
