'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {
      var tabs = [
          {
            name: 'Accueil',
            link: '/',
            icon: 'fa fa-home'
          }, {
            name: 'Fichiers',
            link: '/files',
            icon: 'fa fa-folder'
          }, {
            name: 'Reçus',
            link: '/received',
            icon: 'fa fa-download'
          }, {
            name: 'Groupes',
            link: '/threads',
            icon: 'fa fa-group'
          }, {
            name: 'Liste',
            link: '/lists',
            icon: 'fa fa-list-ul'
          }, {
            name: 'Utilisateurs',
            link: '/users',
            icon: 'fa fa-user'
          },{
            name: 'Invitation de dépôt',
            link: '',
            icon: 'fa fa-external-link'
          }, {
            name: 'Demande invitation de dépôt',
            link: '',
            icon: 'fa fa-location-arrow'
          }, {
            name: 'Favoris',
            link: '/favoris',
            icon: 'fa fa-star'
          }, {
            name: 'Activity',
            link: '',
            icon: 'fa fa-tachometer'
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
