/**
 * @file Angular controller to interact with the home page of AnonymousUrl
 * @copyright LINAGORA © 2009–2019
 * @license AGPL-3.0
 * @module LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('anonymousUrl');
    }])
    .controller('AnonymousHomeController', AnonymousHomeController);

  AnonymousHomeController.$inject = [
    '$scope',
    'message'
  ];

  /**
   * @class AnonymousHomeController
   * @description Controller to manage the Home of anonymous url
   */
  function AnonymousHomeController($scope, message) {
    /* jshint validthis: true */
    var anonymousHomeVm = this;
    anonymousHomeVm.message = message;
  }
})();
