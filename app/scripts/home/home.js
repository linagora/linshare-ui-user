/**
 * HomeController Controller
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .controller('HomeController', homeController);

  homeController.$inject = ['$scope', '$timeout', '$translatePartialLoader', 'lsAppConfig'];

  /**
   * @namespace homeController
   * @desc Application home management system controller
   * @memberOf linshareUiUserApp
   */
  function homeController($scope, $timeout, $translatePartialLoader, lsAppConfig) {
    $scope.lsAppConfig = lsAppConfig;
    $scope.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshareUiUserApp.homeController
     */
    // TODO : IAB externalize fab into directive
    function activate() {
      $translatePartialLoader.addPart('home');

      $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
        flowFile._from = $scope.mySpacePage;
      });

      $scope.$watch('fab.isOpen', function(isOpen) {
        if (isOpen) {
          angular.element('.md-toolbar-tools').addClass('setWhite');
          angular.element('.multi-select-mobile').addClass('setDisabled');
          $timeout(function() {
            angular.element('#overlayMobileFab').addClass('toggledMobileShowOverlay');
            angular.element('#content-container').addClass('setDisabled');
          }, 250);
        } else {
          angular.element('.md-toolbar-tools').removeClass('setWhite');
          $timeout(function() {
            angular.element('.multi-select-mobile').removeClass('setDisabled');
            angular.element('#overlayMobileFab').removeClass('toggledMobileShowOverlay');
            angular.element('#content-container').removeClass('setDisabled');
          }, 250);
        }
      });
    }
  }
})();
