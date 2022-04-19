angular
  .module('linshare.userProfile')
  .factory('meRestService', meRestService);

meRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

function meRestService($log, Restangular, ServerManagerService) {
  const handler = ServerManagerService.responseHandler;

  return {
    deleteFavouriteRecipient,
    getFavouriteRecipients,
    getProfile,
    getRestrictedContacts,
    updateProfile
  };

  ////////////

  function getProfile() {
    $log.debug('meRestService: getProfile');

    return handler(Restangular.all('me').get('profile'));
  }

  function getRestrictedContacts() {
    $log.debug('meRestService: getRestrictedContacts');

    return handler(Restangular.all('me').get('restricted_contacts'));
  }

  function updateProfile(profile) {
    $log.debug('meRestService: updateProfile');

    return handler(Restangular.all('me').one('profile', profile.uuid).customPUT(profile));
  }

  function getFavouriteRecipients() {
    $log.debug('meRestService: getRestrictedContacts');

    return handler(Restangular.all('me').get('favourite_recipients'));
  }

  function deleteFavouriteRecipient(recipient) {
    $log.debug('meRestService: deleteFavouriteRecipient', recipient);

    return handler(Restangular.all('me').one('favourite_recipients', recipient).remove());
  }
}
