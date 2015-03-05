'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {
      var tabs = [
          {
            name: 'Accueil',
            link: '/',
            icon: 'fa-icon'
          }, {
            name: 'Fichiers',
            link: '/files',
            icon: ''
          }, {
            name: 'Reçus',
            link: '/received',
            icon: ''
          }, {
            name: 'Groupes',
            link: '',
            icon: ''
          }, {
            name: 'Liste',
            link: '',
            icon: ''
          }
        ];

      var self = this;

      // Public API here
      return {
        getAvailableTabs: function() {
          $log.debug('Menu:getAvailableTabs');
          return tabs;
        }
      };
    }
);
