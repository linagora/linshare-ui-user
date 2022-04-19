angular
  .module('linshare.userProfile')
  .component('userRecipientsList', {
    template: require('./userRecipientsList.html'),
    controller: 'userRecipientsListController',
    controllerAs: 'userRecipientsListVm'
  });
