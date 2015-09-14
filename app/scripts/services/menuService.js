'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {
      var tabs = [
          {
            name: 'Accueil',
            link: 'home',
            icon: 'md md-home'
          }, {
            name: 'Fichiers',
            link: 'files',
            icon: 'md md-folder'
          }, {
            name: 'Partagés',
            link: 'shared',
            icon: 'md md-publish'
          }, {
            name: 'Reçus',
            link: 'received',
            icon: 'md md-file-download'
          }, {
            name: 'Groupes',
            link: 'threads',
            icon: 'md md-group'
          }, {
            name: 'Liste',
            link: 'lists',
            icon: 'md md-accounts-list-alt'
          }, {
            name: 'Guests',
            link: 'guests',
            icon: 'md md-user'
          },{
            name: 'Invitation de dépôt',
            link: 'upload_request',
            icon: 'md md-external-link'
          }, {
            name: 'Demande invitation de dépôt',
            link: 'upload_proposition',
            icon: 'md md-location-arrow'
          }, {
            name: 'Favoris',
            link: 'favoris',
            icon: 'md md-star'
          }, {
            name: 'Activity',
            link: 'activity',
            icon: 'md md-tachometer'
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
