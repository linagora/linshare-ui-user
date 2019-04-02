/**
 * WorkgroupRevisionsController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('notification');
    }])
    .controller('WorkgroupRevisionsController', WorkgroupRevisionsController);

  WorkgroupRevisionsController.$inject = [
    'toastService'
  ];

  /**
   * @namespace WorkgroupRevisionsController
   * @desc Application revision management system controller
   * @revisionOf LinShare.sharedSpace
   */
  function WorkgroupRevisionsController(
    toastService
  ) {
    var workgroupRevisionsVm = this;
    workgroupRevisionsVm.todo = todo;

    function todo(){
      toastService.error({key: 'Please code me!'});
    }
  }
})();
