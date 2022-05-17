angular
  .module('linshare.guests')
  .component('guestModerators', {
    bindings: {
      guest: '<'
    },
    controller: 'guestModeratorsController',
    controllerAs: 'guestModeratorsVm',
    template: require('./guestModerators.html')
  });
