angular
  .module('linshare.changePassword', [
    'pascalprecht.translate',
    'linshare.components'
  ])
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('changePassword');
  }]);

require('./route');
require('./controller/changePasswordController');
require('./services/changePasswordRestService');