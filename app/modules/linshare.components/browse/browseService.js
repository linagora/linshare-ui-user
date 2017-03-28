/**
 * browseService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('browseService', browseService);

  browseService.$inject = ['$mdDialog', 'componentsConfig'];

  /**
   * @namespace browseService
   * @desc Service to manage browse to move or copy file
   * @memberOf linshare.components
   */
  function browseService($mdDialog, componentsConfig) {
    var service = {
      show: show
    };
    return service;

    /**
     * @namespace show
     * @desc Open the browse dialog
     * @param {Object} _mdDialogLocals - Datas required to browse the list of folders
     * @memberOf linshare.components
     */
    function show(_mdDialogLocals) {
      var mdDialogLocals = _mdDialogLocals;
      mdDialogLocals.$mdDialog = $mdDialog;
      return $mdDialog.show({
        locals: mdDialogLocals,
        controller: 'browseController',
        controllerAs: 'browseVm',
        bindToController: true,
        templateUrl: componentsConfig.path + 'browse/browseTemplate.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: true,
        escapeToClose: false
      });
    }
  }
})();
