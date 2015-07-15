'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {
      var tabs = [
          {
            name: 'Accueil',
            link: '/home',
            icon: 'fa fa-home fa-lg'
          }, {
            name: 'Fichiers',
            link: '/files',
            icon: 'fa fa-folder fa-lg'
          }, {
            name: 'Partagés',
            link: '/shared',
            icon: 'fa fa-download fa-lg'
          }, {
            name: 'Reçus',
            link: '/received',
            icon: 'fa fa-download fa-lg'
          }, {
            name: 'Groupes',
            link: '/threads',
            icon: 'fa fa-group fa-lg'
          }, {
            name: 'Liste',
            link: '/lists',
            icon: 'fa fa-list-ul fa-lg'
          }, {
            name: 'Guests',
            link: '/guests',
            icon: 'fa fa-user fa-lg'
          },{
            name: 'Invitation de dépôt',
            link: 'upload_request',
            icon: 'fa fa-external-link fa-lg'
          }, {
            name: 'Demande invitation de dépôt',
            link: 'upload_proposition',
            icon: 'fa fa-location-arrow fa-lg'
          }, {
            name: 'Favoris',
            link: '/favoris',
            icon: 'fa fa-star fa-lg'
          }, {
            name: 'Activity',
            link: '/activity',
            icon: 'fa fa-tachometer fa-lg'
          }
        ];


      // Public API here
      return {
        getAvailableTabs: function() {
          $log.debug('Menu:getAvailableTabs');
          return tabs;
        }
      };
    }
);
