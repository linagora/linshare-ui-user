angular
  .module('linshareUiUserApp')
  .factory('homePageService', homePageService);

homePageService.$inject = ['lsAppConfig'];

function homePageService(lsAppConfig) {
  var service = {
    getHomePage: getHomePage,
    setUserConfiguredHomePage: setUserConfiguredHomePage,
    unsetUserConfiguredHomePage: unsetUserConfiguredHomePage
  };

  return service;

  function getHomePage () {
    return window.localStorage.getItem('homePage') || lsAppConfig.homePage;
  }

  function setUserConfiguredHomePage (home) {
    window.localStorage.setItem('homePage', home);
  }

  function unsetUserConfiguredHomePage () {
    window.localStorage.removeItem('homePage');
  }
};
