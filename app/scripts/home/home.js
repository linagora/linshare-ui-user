/**
 * HomeController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('home');
    }])
    .controller('HomeController', homeController);

  homeController.$inject = [
    '_',
    '$scope',
    'functionalities',
    'lsAppConfig',
    'user',
    'homePageService'
  ];

  /**
   * @namespace homeController
   * @desc Application home management system controller
   * @memberOf linshareUiUserApp
   */
  function homeController(
    _,
    $scope,
    functionalities,
    lsAppConfig,
    user,
    homePageService
  )
  {
    const { getHomePage, setUserConfiguredHomePage, unsetUserConfiguredHomePage } = homePageService;

    $scope.lsAppConfig = lsAppConfig;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshareUiUserApp.homeController
     */
    // TODO : IAB externalize fab into directive
    function activate() {
      $scope.cards = {
        myFilesSpace: false,
        uploadShare: false,
        uploadGroup: false,
        uploadRequest: false
      };

      $scope.homePage = getHomePage();

      $scope.cards.myFilesSpace = user.canUpload;
      $scope.cards.uploadGroup = functionalities.SHARED_SPACE.enable;
      $scope.cards.uploadShare = ($scope.cards.myFilesSpace || $scope.cards.uploadGroup);
      $scope.cards.receivedShare = !functionalities.ANONYMOUS_URL__HIDE_RECEIVED_SHARE_MENU.enable;
      $scope.cards.uploadRequest = functionalities.UPLOAD_REQUEST.enable;
      $scope.fabButton = {
        toolbar: {
          activate: true,
          label: 'BOUTON_ADD_FILE_TITLE'
        },
        actions: [{
          action: 'documents.upload({from: lsAppConfig.mySpacePage, openSidebar: true})',
          label: 'ADD_FILES_DROPDOWN.UPLOAD_AND_SHARE',
          icon: 'ls-share-file',
          flowBtn: true
        }, {
          action: 'documents.files',
          label: 'ADD_FILES_DROPDOWN.UPLOAD_IN_MY_FILES',
          icon: 'ls-upload-fill',
          flowBtn: true
        }, {
          action: null,
          label: 'ADD_FILES_DROPDOWN.UPLOAD_IN_WORKGROUP',
          icon: 'ls-shared-space disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }]
      };

      $scope.toggleUserConfiguredHomePage = homePage => {
        if ($scope.homePage === homePage) {
          unsetUserConfiguredHomePage();
        } else {
          setUserConfiguredHomePage(homePage);
        }

        $scope.homePage = getHomePage();
      };
    }
  }
})();
