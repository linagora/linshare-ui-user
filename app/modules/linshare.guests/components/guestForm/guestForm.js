angular
  .module('linshare.guests')
  .component('guestForm', {
    bindings: {
      form: '=',
      guestObject: '='
    },
    controller: 'guestFormController',
    controllerAs: 'formVm',
    template: require('./guestForm.html')
  });
