angular
  .module('linshare.userProfile')
  .config(userProfileState);

userProfileState.$inject = ['$stateProvider'];

function userProfileState($stateProvider) {
  $stateProvider
    .state('userProfile', {
      parent: 'common',
      url: '/profile',
      template: require('./views/userProfile.html'),
      controller: 'userProfileController',
      controllerAs: 'userProfileVm',
      resolve: {
        profile: function(meRestService) {
          return meRestService.getProfile();
        },
      }
    });
}