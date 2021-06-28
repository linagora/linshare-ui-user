angular
  .module('linshare.sharedSpace')
  .component('workgroupSearchBox', {
    template: require('./workgroupSearchBox.html'),
    controller: 'workgroupSearchBoxController',
    controllerAs: 'workgroupSearchBoxVm',
    bindings: {
      workgroup: '<',
      params: '<',
      onSubmit: '<'
    }
  });
