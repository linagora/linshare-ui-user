(function() {
  'use strict';

  angular
    .module(
      'linshare.contactsLists',
      [
        'linshare.components',
        'linshare.utils',
        'ngTable',
        'restangular',
        'pascalprecht.translate'
      ]);
})();

require('./constants');
require('./controllers/contactsListsContactsController');
require('./controllers/contactsListsListController');
require('./directives/createContactsList/createContactsListDirective');
require('./directives/createContactsList/createContactsListController');
require('./services/contactsListsContactsRestService');
require('./services/contactsListsContactsRestService');
require('./services/contactsListsListRestService');
require('./services/contactsListsService');