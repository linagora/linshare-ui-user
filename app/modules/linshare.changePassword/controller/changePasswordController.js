angular
  .module('linshare.changePassword')
  .controller('changePasswordController', changePasswordController);

changePasswordController.$inject = [
  'changePasswordRestService',
  'toastService',
  'user',
  'rules'
];

function changePasswordController(
  changePasswordRestService,
  toastService,
  user,
  rules
) {
  const changePasswordVm = this;

  changePasswordVm.user = user;
  changePasswordVm.rules = rules;
  changePasswordVm.changePassword = changePassword;

  function changePassword(form) {
    changePasswordRestService.update(changePasswordVm.oldPassword, changePasswordVm.newPassword)
      .then(() => {
        toastService.success({key: 'CHANGE_PASSWORD.NOTIFICATION.SUCCESS'});

        changePasswordVm.oldPassword = '';
        changePasswordVm.newPassword = '';
        changePasswordVm.newPasswordRetype = '';
        form.$setPristine(true);
      })
      .catch(error => {
        toastService.error({key: 'CHANGE_PASSWORD.NOTIFICATION.ERROR'});
        form.$invalid = true;

        if (error.data && error.data.errCode === 2000) {
          form.oldPassword.$valid = false;
          form.oldPassword.$invalid = true;
        }
      });
  }
}