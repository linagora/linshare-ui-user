'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {
      var tabs = [
          {
            name: 'Accueil',
            link: 'home',
            icon: 'zmdi zmdi-home',
            disabled: false
          }, {
            name: 'Fichiers',
            link: 'documents.files',
            icon: 'zmdi zmdi-folder',
            disabled: false
          }, {
            name: 'Partagés',
            link: 'documents.shared',
            icon: 'zmdi zmdi-upload',
            disabled: true
          }, {
            name: 'Reçus',
            link: 'documents.received',
            icon: 'zmdi zmdi-download',
            disabled: false
          }, {
            name: 'Groupes',
            link: 'documents.threads',
            icon: 'zmdi zmdi-accounts',
            disabled: true
          }, {
            name: 'Liste',
            link: 'lists',
            icon: 'zmdi zmdi-accounts-list',
            disabled: true
          }, {
            name: 'Guests',
            link: 'documents.guests',
            icon: 'zmdi zmdi-account-box-o',
            disabled: true
          },{
            name: 'Invitation de dépôt',
            link: 'upload_request',
            icon: 'zmdi zmdi-arrow-out',
            disabled: true
          }, {
            name: 'Demande invitation de dépôt',
            link: 'upload_proposition',
            icon: 'zmdi zmdi-arrow-in',
            disabled: true
          }, {
            name: 'Favoris',
            link: 'favoris',
            icon: 'zmdi zmdi-star-circle',
            disabled: true
          }, {
            name: 'Activity',
            link: 'activity',
            icon: 'zmdi zmdi-chart-donut',
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
