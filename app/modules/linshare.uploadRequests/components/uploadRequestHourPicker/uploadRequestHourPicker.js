angular
  .module('linshare.uploadRequests')
  .component('uploadRequestHourPicker', {
    template: require('./uploadRequestHourPicker.html'),
    controller: 'uploadRequesetHourPickerController',
    bindings: {
      datetime: '='
    }
  });