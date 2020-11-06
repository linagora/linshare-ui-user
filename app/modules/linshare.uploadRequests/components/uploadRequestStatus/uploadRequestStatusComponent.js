angular
  .module('linshare.uploadRequests')
  .component('uploadRequestStatus', {
    template: require('./uploadRequestStatus.html'),
    bindings: {
      uploadRequest: '<',
      statusUpdate: '<'
    }
  });