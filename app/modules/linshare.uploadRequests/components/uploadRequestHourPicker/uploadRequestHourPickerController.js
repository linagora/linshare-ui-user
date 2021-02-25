angular
  .module('linshare.uploadRequests')
  .controller('uploadRequesetHourPickerController', uploadRequesetHourPickerController);

uploadRequesetHourPickerController.$inject = ['moment', '$scope'];

function uploadRequesetHourPickerController(moment, $scope) {
  const hourPickerVm = this;
  let unwatchDateTime;

  hourPickerVm.$onInit = $onInit;
  hourPickerVm.$onDestroy = $onDestroy;
  hourPickerVm.changeHour = changeHour;

  function $onInit() {
    hourPickerVm.hour = moment(hourPickerVm.datetime).hour();

    unwatchDateTime = $scope.$watch(() => hourPickerVm.datetime, (newValue, oldValue) => {
      if (newValue && (!oldValue || (newValue.getTime() !== oldValue.getTime()))) {
        changeHour();
      }
    });
  };

  function $onDestroy() {
    if (unwatchDateTime) {
      unwatchDateTime();
    }
  }

  function changeHour() {
    hourPickerVm.datetime = moment(hourPickerVm.datetime).set({ hour: hourPickerVm.hour }).toDate();
  };
}