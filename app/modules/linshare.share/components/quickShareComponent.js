angular
  .module('linshare.components')
  .component('quickShare', {
    template: require('./quickShare.html'),
    controller: 'quickShareController',
    controllerAs: 'quickShareVm',
    bindings: {
      shareObject: '=',
      onAfterShare: '='
    }
  });
