'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log, lsAppConfig) {

      var home = {
        name: 'NAVIGATION.HOME',
        link: 'home',
        icon: 'zmdi zmdi-home',
        color: '#05B1FF',
        disabled: false
      };

      var files = {
        name: 'NAVIGATION.FILES',
        icon: 'zmdi zmdi-folder',
        color: '#2196F3',
        disabled: false,
        links: [
          {
            name: 'NAVIGATION.MY_FILES',
            link: 'documents.files',
            disabled: false
          }, {
            name: 'NAVIGATION.RECEIVED_SHARES',
            link: 'documents.received',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.SHARES',
            link: 'documents.shared',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.UPLOAD',
            link: 'documents.upload',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.GROUPS',
            link: 'documents.threads',
            disabled: lsAppConfig.production
          }
        ]
      };

      var administrations = {
        name: 'NAVIGATION.ADMIN',
        icon: 'zmdi zmdi-settings',
        color: '#E91E63',
        disabled: lsAppConfig.production,
        links: [
          {
            name: 'NAVIGATION.LISTS',
            link: 'administration.lists',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.GUESTS',
            link: 'administration.guests',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.USERS',
            link: 'administration.users',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.GROUPS',
            link: 'administration.groups',
            disabled: lsAppConfig.production
          }
        ]
      };

      var uploads = {
        name: 'NAVIGATION.UPLOAD_MANAGMENT',
        icon: 'zmdi zmdi-arrow-in',
        color: '#8BC34A',
        disabled: lsAppConfig.production,
        links: [
          {
            name: 'NAVIGATION.UPLOAD_PROPOSITIONS',
            link: 'upload_request.propositions',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.UPLOAD_REQUESTS',
            link: 'upload_request.requests',
            disabled: lsAppConfig.production
          }
        ]
      };

      var others = {
        name: 'NAVIGATION.AUDIT',
        icon: 'zmdi zmdi-info',
        color: '#FFC107',
        disabled: lsAppConfig.production,
        links: [
          {
            name: 'NAVIGATION.AUDIT_GLOBAL',
            link: 'audit.global',
            disabled: lsAppConfig.production
          }, {
            name: 'NAVIGATION.AUDIT_UPLOAD_REQUEST',
            link: 'audit.upload_request',
            disabled: lsAppConfig.production
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

          //to remove: if
          if (currentState === 'transfert.new_share' ||currentState === 'transfert.new_upload') {
            return {
              color: '#05B1FF'
            }
          }

          var res;
          angular.forEach(tabs, function(value) {
            if (value.links) {
              angular.forEach(value.links, function(link) {
                if (link.link === currentState) {
                  res = value;
                }
              });
            } else if (value.link === currentState) {
              res = value;
            }
          });
          return res;
        },
        getSectionName: function (currentState) {
          var res = null;
          angular.forEach(tabs, function(value) {
            if (value.links) {
              angular.forEach(value.links, function(link) {
                if (link.link === currentState) {
                  res = link;
                }
              });
            } else if (value.link === currentState) {
              res = value;
            }
          });
          return res;
        }
      };
    }
);
