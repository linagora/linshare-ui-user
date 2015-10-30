'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {
      var tabs = [
          {
            name: 'Accueil',
            link: 'home',
            icon: 'md md-home',
            disabled: false
          }, {
            name: 'Fichiers',
            link: 'documents.files',
            icon: 'md md-folder',
            disabled: false
          }, {
            name: 'Partagés',
            link: 'documents.shared',
            icon: 'md md-publish',
            disabled: true
          }, {
            name: 'Reçus',
            link: 'documents.received',
            icon: 'md md-file-download',
            disabled: false
          }, {
            name: 'Groupes',
            link: 'documents.threads',
            icon: 'md md-group',
            disabled: true
          }, {
            name: 'Liste',
            link: 'lists',
            icon: 'md md-recent-actors',
            disabled: true
          }, {
            name: 'Guests',
            link: 'documents.guests',
            icon: 'md md-portrait',
            disabled: true
          },{
            name: 'Invitation de dépôt',
            link: 'upload_request',
            icon: 'md md-call-made',
            disabled: true
          }, {
            name: 'Demande invitation de dépôt',
            link: 'upload_proposition',
            icon: 'md md-call-received',
            disabled: true
          }, {
            name: 'Favoris',
            link: 'favoris',
            icon: 'md md-grade',
            disabled: true
          }, {
            name: 'Activity',
            link: 'activity',
            icon: 'md md-data-usage',
            disabled: true
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
