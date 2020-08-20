(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('welcomeMessageService', welcomeMessageService);

  welcomeMessageService.$inject = ['$http'];

  function welcomeMessageService($http) {
    return function (translationID, language) {
      if (translationID === 'WELCOME_MESSAGE') {
        return $http({
          method: 'GET',
          cache: true,
          url: '/linshare/webservice/rest/user/v2/welcome_messages'
        }).then(function getWelcomeMessage(welcomeMessage) {
          var welcomeMessageData = welcomeMessage['data'][0],
            WELCOME_MESSAGE = '';

          switch(language) {
            case 'en-US':
              WELCOME_MESSAGE = welcomeMessageData['ENGLISH']
              break;
            case 'fr-FR':
              WELCOME_MESSAGE = welcomeMessageData['FRENCH']
              break;
            case 'vi-VN':
              WELCOME_MESSAGE = welcomeMessageData['VIETNAMESE']
              break;
            case 'ru-RU':
              WELCOME_MESSAGE = welcomeMessageData['RUSSIAN']
              break;
          }

          return WELCOME_MESSAGE;
        })
      }
    };
  };

})();
