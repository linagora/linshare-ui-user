angular
  .module('linshare.uploadRequests')
  .component('uploadRequestForm', {
    template: require('./uploadRequestForm.html'),
    bindings: {
      form: '<',
      uploadRequestObject: '='
    },
    controller: 'uploadRequestFormController'
  });