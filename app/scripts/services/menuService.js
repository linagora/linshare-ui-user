'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {

      var home = {
        name: 'NAVIGATION.HOME',
        link: 'home',
        icon: 'zmdi zmdi-home',
        disabled: false
      };

      var files = {
        name: 'NAVIGATION.FILES',
        icon: 'zmdi zmdi-folder',
        links: [
          {
            name: 'NAVIGATION.MY_FILES',
            link: 'documents.files',
            disabled: false
          }, {
            name: 'NAVIGATION.RECEIVED_SHARES',
            link: 'documents.received',
            disabled: false
          }, {
            name: 'NAVIGATION.SHARES',
            link: 'documents.shared',
            disabled: false
          }, {
            name: 'NAVIGATION.GROUPS',
            link: 'documents.threads',
            disabled: false
          }
        ]
      };

      var administrations = {
        name: 'NAVIGATION.ADMIN',
        icon: 'zmdi zmdi-settings',
        links: [
          {
            name: 'NAVIGATION.LISTS',
            link: '#',
            disabled: true
          }, {
            name: 'NAVIGATION.GUESTS',
            link: '#',
            disabled: true
          }, {
            name: 'NAVIGATION.USERS',
            link: '#',
            disabled: true
          }, {
            name: 'NAVIGATION.GROUPS',
            link: '#',
            disabled: true
          }
        ]
      };

      var uploads = {
        name: 'NAVIGATION.UPLOAD_MANAGMENT',
        icon: 'zmdi zmdi-arrow-in',
        links: [
          {
            name: 'NAVIGATION.UPLOAD_PROPOSITIONS',
            link: '#',
            disabled: true
          }, {
            name: 'NAVIGATION.UPLOAD_REQUESTS',
            link: '#',
            disabled: true
          }
        ]
      };

      var others = {
        name: 'NAVIGATION.AUDIT',
        icon: 'zmdi zmdi-info',
        links: [
          {
            name: 'NAVIGATION.AUDIT_GLOBAL',
            link: '#',
            disabled: true
          }, {
            name: 'NAVIGATION.AUDIT_UPLOAD_REQUEST',
            link: '#',
            disabled: true
          }
        ]
      };

      var tabs = [home, files, administrations, uploads, others];

      // Public API here
      return {
        getAvailableTabs: function() {
          $log.debug('Menu:getAvailableTabs');
          return tabs;
        }
      };
    }
);
