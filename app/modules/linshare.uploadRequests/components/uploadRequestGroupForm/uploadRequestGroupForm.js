angular
  .module('linshare.uploadRequests')
  .component('uploadRequestGroupForm', {
    template: require('./uploadRequestGroupForm.html'),
    bindings: {
      uploadRequestGroupObject: '=',
      createRecipientList: '=',
      selectedTabIndex: '=',
      form: '=',
      operation: '@'
    },
    controller: 'uploadRequestGroupFormController'
  });