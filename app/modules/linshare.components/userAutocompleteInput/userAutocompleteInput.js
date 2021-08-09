angular
  .module('linshare.components')
  .component('userAutocompleteInput', {
    template: require('./userAutocompleteInput.html'),
    controller: 'userAutocompleteInputController',
    controllerAs: 'inputVm',
    bindings: {
      searchType: '@',
      placeholder: '@',
      onSelect: '<',
      allowCreatingGuest: '<',
      allowAddingEmail: '<',
      disabled: '<'
    }
  });