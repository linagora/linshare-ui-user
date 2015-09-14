'use strict';

/**
 * @ngdoc function
 * @name linshareUiUserApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the linshareUiUserApp
 */
angular.module('linshareUiUserApp')
  .controller('HomeController', function ($scope, user) {
    $scope.awesomeHome = 'Welcome to LinShare, THE Secure, Open-Source File Sharing Tool.';
    $scope.user = user;
  });
