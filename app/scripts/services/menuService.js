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
            link: 'documents.files',
            icon: 'md md-folder'
          }, {
            name: 'Partagés',
            link: 'documents.shared',
            icon: 'md md-publish'
          }, {
            name: 'Reçus',
            link: 'documents.received',
            icon: 'md md-file-download'
          }, {
            name: 'Groupes',
            link: 'documents.threads',
            icon: 'md md-group'
          }, {
            name: 'Liste',
            link: 'lists',
            icon: 'md md-recent-actors'
          }, {
            name: 'Guests',
            link: 'documents.guests',
            icon: 'md md-portrait'
          },{
            name: 'Invitation de dépôt',
            link: 'upload_request',
            icon: 'md md-call-made'
          }, {
            name: 'Demande invitation de dépôt',
            link: 'upload_proposition',
            icon: 'md md-call-received'
          }, {
            name: 'Favoris',
            link: 'favoris',
            icon: 'md md-grade'
          }, {
            name: 'Activity',
            link: 'activity',
            icon: 'md md-data-usage'
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
