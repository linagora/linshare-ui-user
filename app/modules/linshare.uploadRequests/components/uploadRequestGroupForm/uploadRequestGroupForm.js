angular
  .module('linshare.uploadRequests')
  .component('uploadRequestGroupForm', {
    template: require('./uploadRequestGroupForm.html'),
    bindings: {
      uploadRequestGroupObject: '=',
      linshareModeProduction: '<',
      closeDropdown: '=',
      createRecipientList: '=',
      selectedTabIndex: '=',
      form: '=',
      operation: '@'
    },
    controller: 'uploadRequestGroupFormController'
  });