angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupFormController', uploadRequestGroupFormController);

uploadRequestGroupFormController.$inject = ['$timeout'];

function uploadRequestGroupFormController($timeout) {
  const uploadRequestGroupFormVm = this;

  uploadRequestGroupFormVm.revalidateDateFields = revalidateDateFields;
  uploadRequestGroupFormVm.displayAdvancedOptions = false;
  uploadRequestGroupFormVm.toggleDisplayAdvancedOptions = toggleDisplayAdvancedOptions;

  function revalidateDateFields() {
    $timeout(() => {
      uploadRequestGroupFormVm.form.notificationDate.$validate();
      uploadRequestGroupFormVm.form.expirationDate.$validate();
      uploadRequestGroupFormVm.form.activationDate.$validate();
    });
  }

  function toggleDisplayAdvancedOptions() {
    if (uploadRequestGroupFormVm.displayAdvancedOptions) {
      uploadRequestGroupFormVm.displayAdvancedOptions = false;
    } else {
      uploadRequestGroupFormVm.displayAdvancedOptions = true;
      $('#upload-request-edit').animate(
        {
          scrollTop: $('#advanced-options-anchor').offset().top
        },
        400
      );
    }
  }
}
