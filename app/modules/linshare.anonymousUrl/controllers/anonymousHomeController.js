/**
 * AnonymousHomeController Controller
 * @namespace LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('anonymousUrl');
    }])
    .controller('AnonymousHomeController', AnonymousHomeController);

  AnonymousHomeController.$inject = ['$scope', 'message'];

  /**
   *  @namespace AnonymousHomeController
   *  @desc Controller to manage the Home of anonymous url
   *  @memberOf LinShare.anonymousUrl
   */
  function AnonymousHomeController($scope, message) {
    /* jshint validthis: true */
    var anonymousHomeVm = this;
    anonymousHomeVm.message = message;
  }
})();
