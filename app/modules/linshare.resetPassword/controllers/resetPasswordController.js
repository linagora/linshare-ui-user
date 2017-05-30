/**
 * ResetPasswordController Controller
 * @namespace LinShare.resetPassword
 */
(function() {
  'use strict';

  angular
    .module('linshare.resetPassword')
    .controller('ResetPasswordController', ResetPasswordController);

  ResetPasswordController.$inject = ['_', '$log', '$state', '$timeout', '$translatePartialLoader',
    'languageService', 'lsAppConfig', 'resetPasswordService', 'resetUuid','toastService'
  ];

  /**
   *  @namespace ResetPasswordController
   *  @desc Reset password management system controller
   *  @memberOf LinShare.resetPassword
   */
  function ResetPasswordController(_, $log, $state, $timeout, $translatePartialLoader,
    languageService, lsAppConfig, resetPasswordService, resetUuid, toastService) {
    /* jshint validthis: true */
    var resetVm = this;
    var
      language,
      country,
      locale = languageService.getLocale();

    resetVm.changeLoginLanguage = changeLoginLanguage;
    resetVm.loginLocale = splitLocale(locale);
    resetVm.lsAppConfig = lsAppConfig;
    resetVm.notify = notify;
    resetVm.reset = {};

    activate();

    ////////////

    /**
     *  @name activate
     *  @desc Activation function of the controller, launch at every instantiation
     *  @memberOf LinShare.resetPassword.ResetPasswordController
     */
    function activate() {
      resetVm.reset.uuid = resetUuid !== '' ? resetUuid : undefined;
      $translatePartialLoader.addPart('general');
      if (_.isUndefined(resetVm.reset.uuid)) {
        resetVm.reset.type = 'forgot';
        resetVm.reset.action = actionForgot;
        resetVm.reset.data = undefined;
      } else {
        resetPasswordService.get(resetVm.reset.uuid).then(function(data) {
          if (data.data.kind === 'NEW_PASSWORD') {
            resetVm.reset.type = 'create';
            resetVm.reset.action = actionCreate;
          } else {
            resetVm.reset.type = 'update';
            resetVm.reset.action = actionUpdate;
          }
          resetVm.reset.data = data.data;
        }).catch(function(data) {
          resetVm.notify(data);
          $state.transitionTo('reset');
        });
      }
    }

    /**
     *  @name actionCreate
     *  @desc Valid the form of change password to finalize sign-up
     *  @param {Object} formData - Data from the reset password form
     *  @returns {Promise} Server response
     *  @memberOf LinShare.resetPassword.ResetPasswordController
     */
    function actionCreate(formData) {
      return resetPasswordService.update(formData).then(function() {
        resetVm.reset.type = 'finalize';
        $timeout(function() {
          $state.transitionTo('login');
        }, 5000);
      }).catch(function(data) {
        resetVm.notify(data);
      });
    }

    /**
     *  @name actionForgot
     *  @desc Valid the form of request change password
     *  @param {Object} formData - Data from the reset password form
     *  @returns {Promise} Server response
     *  @memberOf LinShare.resetPassword.ResetPasswordController
     */
    function actionForgot(formData) {
      resetVm.reset.data = formData;
      return resetPasswordService.reset(formData.email).then(function() {
        resetVm.reset.type = 'reinitialize';
      }).catch(function(data) {
        resetVm.notify(data);
      });
    }

    /**
     *  @name actionUpdate
     *  @desc Valid the form of change password to update
     *  @param {Object} formData - Data from the reset password form
     *  @returns {Promise} Server response
     *  @memberOf LinShare.resetPassword.ResetPasswordController
     */
    function actionUpdate(formData) {
      return resetPasswordService.update(formData).then(function() {
        resetVm.reset.type = 'finalize';
        $timeout(function() {
          $state.transitionTo('login');
        }, 5000);
      }).catch(function(data) {
        resetVm.notify(data);
      });
    }

    /**
     *  @name changeLoginLanguage
     *  @desc TODO [TOFILL]
     *  @param {TODO [TOFILL]} lang - TODO [TOFILL]
     *  @memberOf LinShare.resetPassword.ResetPasswordController
     */
    function changeLoginLanguage(lang) {
      languageService.changeLocale(lang);
      resetVm.loginLocale = splitLocale(lang);
    }

    /**
     *  @name notify
     *  @desc Send message to the console and by toast
     *  @param {Object} data - Server response object
     *  @memberOf LinShare.resetPassword.ResetPasswordController
     */
    function notify(data) {
      var message = data.data.message;
      toastService.error(message);
      $log.error('resetPasswordController - notify', data);
    }

    /**
     *  @name splitLocale
     *  @desc TODO [TOFILL]
     *  @param {TODO [TOFILL]} locale - TODO [TOFILL]
     *  @returns {TODO [TOFILL]} TODO [TOFILL]
     *  @memberOf LinShare.resetPassword.ResetPasswordController
     */
    function splitLocale(locale) {
      locale = locale.split('-');
      language = locale[0];
      if (locale.length > 1) {
        country = locale[1].toLowerCase();
      }
      return {
        language: language,
        country: country
      };
    }
  }
})();
