angular
  .module('linshare.components')
  .component('sidebarDescriptionInput', {
    template: require('./sidebarDescriptionInput.html'),
    bindings: {
      description: '<',
      onChange: '<',
      readonly: '<',
      placeholder: '@'
    }
  });