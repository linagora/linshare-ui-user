angular
  .module('linshare.uploadRequests')
  .component('uploadRequestGroupForm', {
    template: require('./uploadRequestGroupForm.html'),
    bindings: {
      uploadRequestGroupObject: '=',
      createRecipientList: '=',
      form: '=',
      displayAdvancedOptions: '=',
      operation: '@'
    },
    controller: 'uploadRequestGroupFormController'
  });