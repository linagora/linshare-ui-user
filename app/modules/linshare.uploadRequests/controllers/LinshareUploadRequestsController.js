/**
 * LinShareUploadRequestsController Controller
 * @namespace UploadRequests
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.uploadRequests')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('uploadRequests');
      $translatePartialLoaderProvider.addPart('filesList');
    }])
    .controller('LinshareUploadRequestsController', LinshareUploadRequestsController);

  //TODO - KLE: Check DI
  LinshareUploadRequestsController.$inject = [
    '_',
    '$scope',
    'lsAppConfig'
  ];

  /**
   * @namespace LinshareUploadRequestsController
   * @desc Application guest management system controller
   * @memberOf LinShare.UploadRequests
   */
  // TODO: Should dispatch some function to other service or controller in order to valid the maxparams linter
  /* jshint maxparams: false, maxstatements: false */
  function LinshareUploadRequestsController(
    _,
    $scope,
    lsAppConfig
  ) {
    /* jshint validthis: true */
    var uploadRequestVm = this;

    uploadRequestVm.flagsOnSelectedPages = {};
    uploadRequestVm.guestDetails = lsAppConfig.guestDetails;
    uploadRequestVm.isMineGuest = true;
    uploadRequestVm.loadSidebarContent = loadSidebarContent;
    uploadRequestVm.loggedUser = $scope.loggedUser;
    uploadRequestVm.uploadRequestCreate = lsAppConfig.uploadRequestCreate;
    uploadRequestVm.paramFilter = {};
    uploadRequestVm.selectedGuest = {};
    uploadRequestVm.selectedUploadRequests = [];
    uploadRequestVm.toggleSelectedSort = true;
    uploadRequestVm.mdtabsSelection = {
      selectedIndex: 0
    };
    uploadRequestVm.toggleMoreOptions = toggleMoreOptions;
    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} content - The id of the content to load
     *                           See app/views/includes/sidebar-right.html for possible values
     * @memberOf LinShare.UploadRequests.LinshareUploadRequestsController
     */
    function loadSidebarContent(content, type) {
      uploadRequestVm.type = type;
      $scope.mainVm.sidebar.setData(uploadRequestVm);
      $scope.mainVm.sidebar.setContent(content || lsAppConfig.uploadRequestCreate);
      $scope.mainVm.sidebar.show();
    }

    function toggleMoreOptions(state) {
      uploadRequestVm.mdtabsSelection.selectedIndex = state ? 1 : 0;
    }

    ////=====> FROM HERE LIES TERROR YOU NEVER SAW, BE PREPARED AND DIE WATCHING

    //-----------
    // - Variable
    //-----------
    uploadRequestVm.selectedValue = 0;

    //-----------
    // - Function
    //-----------
    // TODO - KLE: add directive to focus the input of #top-search-wrap  if class labeled : search-toggled
    // was added to the #drop-area element;
    uploadRequestVm.openSearch = function() {
      angular.element('#top-search-wrap input').focus();
    };

    // \- Mobile specific -/
    // TODO - KLE: if searchMobileDropdown is off then reset search state by removing the current search value and
    // refresh filter result
    uploadRequestVm.closeSearch = function() {
      angular.element('#searchInMobileFiles').val('').trigger('change');
    };

    //TODO - KLE: Close multiselect on mobile view
    uploadRequestVm.singleEventFab = function($event) {
      $event.stopPropagation();
    };
  }
})();
