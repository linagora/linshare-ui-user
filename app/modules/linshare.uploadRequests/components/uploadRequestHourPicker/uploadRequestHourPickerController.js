angular
  .module('linshare.uploadRequests')
  .controller('uploadRequesetHourPickerController', uploadRequesetHourPickerController);

uploadRequesetHourPickerController.$inject = ['moment'];

function uploadRequesetHourPickerController(moment) {
  const hourPickerVm = this;

  hourPickerVm.$onInit = $onInit;
  hourPickerVm.changeHour = changeHour;

  function $onInit() {
    hourPickerVm.hour = moment(hourPickerVm.datetime).hour();
  };

  function changeHour() {
    hourPickerVm.datetime = moment(hourPickerVm.datetime).set({ hour: hourPickerVm.hour }).toDate();
  };
}