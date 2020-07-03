/**
 * sharedKeyRemovalController Controller
 * @namespace LinShare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .controller('sharedKeyRemovalController', sharedKeyRemovalController);

  sharedKeyRemovalController.$inject = [
    '$state',
    'itemUtilsService',
    'lsAppConfig',
    'toastService',
    'secondFactorAuthenticationRestService',
    'secondFactorAuthenticationTransitionService'
  ];

  /**
   * @namespace sharedKeyRemovalController
   * @desc Application secondFactorAuthentication second factor authentication controller
   * @memberOf LinShare.secondFactorAuthentication
   */

  /* jshint maxparams: false, maxstatements: false */
  function sharedKeyRemovalController(
    $state,
    itemUtilsService,
    lsAppConfig,
    toastService,
    secondFactorAuthenticationRestService,
    secondFactorAuthenticationTransitionService
  ) {
    /* jshint validthis:true */
    var sharedKeyRemovalControllerVm = this;

    sharedKeyRemovalControllerVm.showDeleteModal = showDeleteModal;
    sharedKeyRemovalControllerVm.dateFormat = lsAppConfig.locale.mediumDate

    function showDeleteModal() {
      itemUtilsService.deleteItem(null, '2FA_SHARED_KEY', removeSharedKey)
    }

    function removeSharedKey() {
      secondFactorAuthenticationRestService.remove(sharedKeyRemovalControllerVm.user.uuid)
        .then(function() {
          toastService.success({key: 'SECOND_FACTOR_AUTH.SHARED_KEY_REMOVAL.REMOVAL_SUCCESS'});
          secondFactorAuthenticationTransitionService.registerHook();
          $state.reload();
        });
    }
  }
})();
