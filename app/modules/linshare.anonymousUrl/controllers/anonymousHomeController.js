/**
 * AnonymousHomeController Controller
 * @namespace LinShare.anonymousUrl
 */
(function() {
  'use strict';

  angular
    .module('linshare.anonymousUrl')
    .controller('AnonymousHomeController', AnonymousHomeController);

  AnonymousHomeController.$inject = ['$scope', '$translatePartialLoader', 'message'];

  /**
   *  @namespace AnonymousHomeController
   *  @desc Controller to manage the Home of anonymous url
   *  @memberOf LinShare.anonymousUrl
   */
  function AnonymousHomeController($scope, $translatePartialLoader, message) {
    /* jshint validthis: true */
    var anonymousHomeVm = this;
    anonymousHomeVm.message = message;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.anonymousUrl.AnonymousHomeController
     */
    function activate() {
      $translatePartialLoader.addPart('anonymousUrl');
    }
  }
})();
