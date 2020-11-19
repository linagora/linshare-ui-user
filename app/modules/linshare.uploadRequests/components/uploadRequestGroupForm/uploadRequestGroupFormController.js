angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestGroupFormController', uploadRequestGroupFormController);

uploadRequestGroupFormController.$inject = ['moment'];
function uploadRequestGroupFormController(moment) {
  const uploadRequestGroupFormVm = this;

  uploadRequestGroupFormVm.$onInit = onInit;
  uploadRequestGroupFormVm.formatDateForDatepicker = formatDateForDatepicker;

  function onInit() {
    uploadRequestGroupFormVm.selectedTabIndex = uploadRequestGroupFormVm.selectedTabIndex || 0;
  }

  function formatDateForDatepicker(value, format = 'YYYY-MM-DD') {
    return value ? moment(value).format(format) : value;
  }
}
