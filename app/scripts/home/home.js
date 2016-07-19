'use strict';

/**
 * @ngdoc function
 * @name linshareUiUserApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the linshareUiUserApp
 */
angular.module('linshareUiUserApp')
  .controller('HomeController', function ($scope, $translatePartialLoader,$timeout) {
    $translatePartialLoader.addPart('home');
    $scope.fab = {
      isOpen: false,
      count: 0,
      selectedDirection: 'left'
    };
    $scope.$watch('fab.isOpen', function(isOpen) {
      if(isOpen) {
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
  });
