angular
  .module('linshare.components')
  .component('dateTimePicker', {
    template: require('./dateTimePicker.html'),
    controller: 'dateTimePickerController',
    controllerAs: 'dateTimeVm',
    bindings: {
      datetime: '<',
      onChange: '<',
      disabled: '<',
      required: '<',
      options: '<'
    }
  });