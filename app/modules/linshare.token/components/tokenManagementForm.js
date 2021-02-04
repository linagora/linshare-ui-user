angular
  .module('linshare.token')
  .component('tokenManagementForm', {
    template: require('./tokenManagementForm.html'),
    bindings: {
      tokenObject: '='
    },
    controller: 'tokenManagementFormController'
  });