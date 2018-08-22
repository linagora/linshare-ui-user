/**
 * DebugModeSwitcher Controller
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('DebugModeSwitcherController', DebugModeSwitcherController);

  DebugModeSwitcherController.$inject = [
    '$window',
    '_',
    'localStorageService',
    'lsAppConfig',
    'toastService'
  ];

  function DebugModeSwitcherController(
    $window,
    _,
    localStorageService,
    lsAppConfig,
    toastService
  ) {
    var debugModeSwitcherVm = this;

    debugModeSwitcherVm.$onInit = $onInit;
    debugModeSwitcherVm.onSwitcherModelChange = onSwitcherModelChange;

    /**
     * @name $onInit
     * @desc Initialization function of the component
     * @namespace linshare.components.DebugModeSwitcherController
     */
    function $onInit() {
      var isActivatedDebugModeFromLocalStorage = localStorageService.get('debugMode');

      debugModeSwitcherVm.isActivated = !_.isNil(isActivatedDebugModeFromLocalStorage) ?
        localStorageService.get('debugMode') :
        lsAppConfig.debug;
    }

    /**
     * @name onSwitcherModelChange
     * @desc Called whenever md-switch model change
     * @memberOf linshare.components.DebugModeSwitcherController
     */
    function onSwitcherModelChange() {
      localStorageService.set('debugMode', debugModeSwitcherVm.isActivated);
      notify();
    }

    /**
     * @name notify
     * @desc Notify the change of the debug mode
     * @memberOf linshare.components.DebugModeSwitcherController
     */
    function notify() {
      toastService
        .success(
          { key: 'TOAST_ALERT.ACTION.REFRESH' },
          'TOAST_ALERT.ACTION_REFRESH'
        )
        .then(function(response) {
          if (response && response.actionClicked) {
            $window.location.reload();
          }
        });
    }
  }
})();
