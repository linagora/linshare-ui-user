angular
  .module('linshare.uploadRequests')
  .component('uploadRequestHourPicker', {
    template: require('./uploadRequestHourPicker.html'),
    bindings: {
      hour: '=',
      onChangeHour: '=',
      dateType: '@'
    }
  });