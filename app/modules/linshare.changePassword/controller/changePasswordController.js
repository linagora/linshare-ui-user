/**
 * changePasswordController Controller
 * @namespace LinShare.changePassword
 */
(function() {
  'use strict';
  angular
    .module('linshare.changePassword')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('changePassword');
    }])
    .controller('changePasswordController', changePasswordController);

  changePasswordController.$inject = ['$scope', 'changePasswordRestService', 'toastService', 'user', 'rules'];

  /**
   * @namespace changePasswordController
   * @desc Application changePassword change password controller
   * @memberOf LinShare.changePassword
   */

  /* jshint maxparams: false, maxstatements: false */
  function changePasswordController($scope, changePasswordRestService, toastService, user, rules) {
    /* jshint validthis:true */
    var changePasswordVm = this;

    changePasswordVm.user = user;
    changePasswordVm.rules = rules;
    changePasswordVm.changePassword = changePassword;

    function changePassword(form) {
      changePasswordRestService.update(changePasswordVm.oldPassword, changePasswordVm.newPassword)
        .then(function() {
          toastService.success({key: 'CHANGE_PASSWORD.NOTIFICATION.SUCCESS'});

          changePasswordVm.oldPassword = '';
          changePasswordVm.newPassword = '';
          changePasswordVm.newPasswordRetype = '';
          form.$setPristine(true);
        })
        .catch(function(error) {
          toastService.error({key: 'CHANGE_PASSWORD.NOTIFICATION.ERROR'});
          form.$invalid = true;

          if (error.data && error.data.errCode === 2000) {
            form.oldPassword.$valid = false;
            form.oldPassword.$invalid = true;
          }
        });
    }
  }
})();
