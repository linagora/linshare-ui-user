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

  const errorHandlers = {
    2000: form => {
      form.oldPassword.$valid = false;
      form.oldPassword.$invalid = true;
    },
    28411: () => {
      changePasswordVm.newPassword = '';
      changePasswordVm.newPasswordRetype = '';
      toastService.error({key: 'CHANGE_PASSWORD.NOTIFICATION.ERROR.USED_PASSWORD'});
    },
    default: () => {
      toastService.error({key: 'CHANGE_PASSWORD.NOTIFICATION.ERROR.DEFAULT'});
    }
  };

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
        form.$invalid = true;

        if (
          error.data &&
          error.data.errCode &&
          errorHandlers[error.data.errCode]
        ) {
          return errorHandlers[error.data.errCode](form);
        }

        errorHandlers.default(form);
      });
  }
}