angular
  .module('linshare.uploadRequests')
  .component('uploadRequestGroupForm', {
    template: require('./uploadRequestGroupForm.html'),
    bindings: {
      form: '=',
      operation: '@',
      uploadRequestGroupObject: '='
    },
    controller: 'uploadRequestGroupFormController'
  });