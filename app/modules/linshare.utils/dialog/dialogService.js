/**
 * dialogService Factory
 * @namespace linshare.utils
 */
(function() {
  'use strict';

  angular
    .module('linshare.utils')
    .factory('dialogService', dialogService);

  dialogService.$inject = [
    '$q',
    'swal',
    '$mdDialog'
  ];

  /**
   * @namespace dialogService
   * @desc Utils service for manipulating file
   * @memberOf linshare.utils
   */
  function dialogService(
    $q,
    swal,
    $mdDialog
  )
  {
    var service = {
      /**
       * Enum for dialog type
       * @readonly
       * @enum {string}
       */
      dialogType: {
        error: 'error',
        info: 'info',
        question: 'question',
        success: 'success',
        warning: 'warning'
      },
      dialogConfirmation: dialogConfirmation,
      dialogInput: dialogInput
    };

    return service;

    ////////////

    /**
     * @name dialogConfirmation
     * @desc Show a dialog confirmation with given text and type
     * @param {Object} sentences - Contains all the the sentences to set in the dialog
     * @param {dialogType} [type=dialogType.info] - One of the type defined in dialogType
     * @memberOf linshare.utils.dialogService
     */
    function dialogConfirmation(sentences, type) {
      var currentType = type || service.dialogType.info;

      const cancelButton = {
        text: sentences.buttons.cancel,
        closeModal: true,
        visible: true
      };

      const confirmButton = {
        text: sentences.buttons.confirm,
        closeModal: true,
        visible: true
      };

      return swal({
        title: sentences.title,
        text: sentences.text,
        icon: currentType,
        buttons: [cancelButton, confirmButton],
        className: 'sweet-alert'
      });
    }

    function dialogInput(options) {
      return $mdDialog.show({
        ok: options.ok || 'ACTION.SAVE',
        cancel: options.cancel || 'NAVIGATION.CANCEL',
        title: options.title,
        initialValue: options.initialValue,
        template: require('./dialogInput/dialogInput.html'),
        controller: 'dialogInputController',
        controllerAs: 'dialogInputVm',
        bindToController: true
      });
    }
  }
})();
