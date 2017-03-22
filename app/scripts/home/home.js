/**
 * HomeController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('HomeController', homeController);

  homeController.$inject = ['$scope', '$timeout', '$translate', '$translatePartialLoader', 'lsAppConfig',
    'welcomeMessageRestService'
  ];

  /**
   * @namespace homeController
   * @desc Application home management system controller
   * @memberOf linshareUiUserApp
   */
  function homeController($scope, $timeout, $translate, $translatePartialLoader, lsAppConfig, welcomeMessageRestService) {
    const LANG_CONVERTER = {
      ENGLISH: {
        lang: 'ENGLISH',
        key: lsAppConfig.lang.en
      },
      FRENCH: {
        lang: 'FRENCH',
        key: lsAppConfig.lang.fr
      },
      VIETNAMESE: {
        lang: 'VIETNAMESE',
        key: lsAppConfig.lang.vi
      }
    };

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
      $scope.fabButton = {
        toolbar: {
          activate: true,
          label: 'BOUTON_ADD_FILE_TITLE'
        },
        actions: [{
          action: 'documents.upload({from: lsAppConfig.mySpacePage})',
          label: 'ADD_FILES_DROPDOWN.UPLOAD_AND_SHARE',
          icon: 'groups-home-share',
          flowBtn: true
        }, {
          action: 'documents.files',
          label: 'ADD_FILES_DROPDOWN.UPLOAD_IN_MY_FILES',
          icon: 'zmdi zmdi-file-plus',
          flowBtn: true
        }, {
          action: null,
          label: 'ADD_FILES_DROPDOWN.UPLOAD_IN_WORKGROUP',
          icon: 'zmdi zmdi-accounts-alt disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }]
      };

      $translatePartialLoader.addPart('home');

      $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
        flowFile._from = $scope.mySpacePage;
      });

      getWelcomeMessage();
    }

    function getWelcomeMessage() {
      welcomeMessageRestService.getList().then(function(data) {
        var lang_object = _.find(LANG_CONVERTER, {
          key: $translate.use()
        });
        var lang = lang_object ? lang_object.lang : 'ENGLISH';
        $scope.welcomeMessage = data[0][lang];
      });
    }
  }
})();
