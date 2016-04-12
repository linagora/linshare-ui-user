'use strict';

/**
 * @ngdoc function
 * @name linshareUiUserApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the linshareUiUserApp
 */
angular.module('linshareUiUserApp')
  .controller('HomeController', function ($scope, $translatePartialLoader) {
    $translatePartialLoader.addPart('home');
  });
