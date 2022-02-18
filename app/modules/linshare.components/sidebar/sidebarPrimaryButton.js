angular
  .module('linshare.components')
  .component('sidebarPrimaryButton', {
    template: require('./sidebarPrimaryButton.html'),
    transclude: true,
    bindings: {
      loading: '<',
      onClick: '&',
      disabled: '<'
    }
  });
