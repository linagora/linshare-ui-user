'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log) {

      var home = {
        name: 'NAVIGATION.HOME',
        link: 'home',
        icon: 'zmdi zmdi-home',
        color: '#03A9F4',
        // blue
        // purple
        // color: '#673AB7',
        disabled: false
      };

      var files = {
        name: 'NAVIGATION.FILES',
        icon: 'zmdi zmdi-folder',
        // pink
        // color: '#2196F3',
        // blue
        color: '#2196F3',
        links: [
          {
            name: 'NAVIGATION.MY_FILES',
            link: 'documents.files',
            disabled: false
          }
          , {
            name: 'NAVIGATION.RECEIVED_SHARES',
            link: 'documents.received',
            disabled: false
          }
          , {
            name: 'NAVIGATION.SHARES',
            link: 'documents.shared',
            disabled: false
          }
          , {
            name: 'NAVIGATION.GROUPS',
            link: 'documents.threads',
            disabled: false
          }
        ]
      };

      var administrations = {
        name: 'NAVIGATION.ADMIN',
        icon: 'zmdi zmdi-settings',
        color: '#E91E63',
        links: [
          {
            name: 'NAVIGATION.LISTS',
            link: 'administration.lists',
            disabled: true
          }, {
            name: 'NAVIGATION.GUESTS',
            link: 'administration.guests',
            disabled: true
          }, {
            name: 'NAVIGATION.USERS',
            link: 'administration.users',
            disabled: true
          }, {
            name: 'NAVIGATION.GROUPS',
            link: 'administration.groups',
            disabled: true
          }
        ]
      };

      var uploads = {
        name: 'NAVIGATION.UPLOAD_MANAGMENT',
        icon: 'zmdi zmdi-arrow-in',
        color: '#8BC34A',
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
        color: '#FFC107',
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
        },
        getProperties: function (currentState) {
          var res;
          angular.forEach(tabs, function(value) {
            if (value.links) {
              angular.forEach(value.links, function(link) {
                if (link.link == currentState) {
                  res = value;
                }
              })
            } else if (value.link == currentState) {
              res = value;
            }
          });
          return res;
        },
        getSectionName: function (currentState) {
          var res;
          angular.forEach(tabs, function(value) {
            if (value.links) {
              angular.forEach(value.links, function(link) {
                if (link.link == currentState) {
                  res = link;
                }
              })
            } else if (value.link == currentState) {
              res = value;
            }
          });
          return res;
        }
      };
    }
);
