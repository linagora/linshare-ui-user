angular
  .module('linshareUiUserApp')
  .factory('supportLinkService', supportLinkService);

supportLinkService.$inject = ['$window', 'lsAppConfig', 'authenticationRestService', 'languageService'];

function supportLinkService($window, lsAppConfig, authenticationRestService, languageService) {
  return {
    getLinkName,
    isEnable,
    openSupportLink
  };

  /////

  function isEnable() {
    return lsAppConfig.supportLink.enable;
  }

  function getLinkName() {
    return lsAppConfig.supportLink.name;
  }

  function openSupportLink() {
    if (!isEnable() || !lsAppConfig.supportLink.url) {
      return;
    }

    if (lsAppConfig.supportLink.provider === 'crisp') {
      return authenticationRestService.getCurrentUser()
        .then(currentUser => {
          $window.open(`${lsAppConfig.supportLink.url}&user_email=${currentUser.mail}&locale=${languageService.getLocale().fullKey}`);
        });
    }

    return $window.open(lsAppConfig.supportLink.url);
  }
}
