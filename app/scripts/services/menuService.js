'use strict';

angular.module('linshareUiUserApp')
  .factory('MenuService', function($log, lsAppConfig) {

      var home = {
        name: 'MENU_TITLE.HOME',
        link: 'home',
        icon: 'zmdi zmdi-home',
        color: '#05B1FF',
        disabled: false
      };

      var files = {
        name: 'MENU_TITLE.FILES',
        icon: 'fa fa-files-o',
        color: '#2196F3',
        disabled: false,
        links: [
          {
            name: 'MENU_TITLE.MY_FILES',
            link: 'documents.files',
            disabled: false
          }, {
            name: 'MENU_TITLE.RECEIVED_SHARES',
            link: 'documents.received',
            disabled: false
          }, {
            name: 'MENU_TITLE.SHARES',
            link: 'documents.shared',
            disabled: true
          }
        ]
      };

    var groups = {
      name: 'MENU_TITLE.GROUPS',
      link: 'documents.threads',
      icon: 'zmdi zmdi-accounts-alt',
      color: '#05B1FF',
      disabled: true
    };

      var administrations = {
        name: 'MENU_TITLE.ADMIN',
        icon: 'zmdi zmdi-settings',
        color: '#E91E63',
        disabled: !lsAppConfig.devMode,
        links: [
          {
            name: 'MENU_TITLE.LISTS',
            link: 'administration.lists',
            disabled: lsAppConfig.production
          }, {
            name: 'MENU_TITLE.GUESTS',
            link: 'administration.guests',
            disabled: lsAppConfig.production
          }, {
            name: 'MENU_TITLE.USERS',
            link: 'administration.users',
            disabled: lsAppConfig.production
          }, {
            name: 'MENU_TITLE.GROUPS',
            link: 'administration.groups',
            disabled: lsAppConfig.production
          }
        ]
      };

      var uploads = {
        name: 'MENU_TITLE.UPLOAD_MANAGMENT',
        icon: 'zmdi zmdi-pin-account',
        color: '#8BC34A',
        disabled: lsAppConfig.production,
        links: [
          {
            name: 'MENU_TITLE.UPLOAD_PROPOSITIONS',
            link: 'upload_request.propositions',
            disabled: lsAppConfig.production
          }, {
            name: 'MENU_TITLE.UPLOAD_REQUESTS',
            link: 'upload_request.requests',
            disabled: lsAppConfig.production
          }
        ]
      };

      var others = {
        name: 'MENU_TITLE.AUDIT',
        icon: 'fa fa-line-chart',
        color: '#FFC107',
        disabled: lsAppConfig.production,
        links: [
          {
            name: 'MENU_TITLE.AUDIT_GLOBAL',
            link: 'audit.global',
            disabled: lsAppConfig.production
          }, {
            name: 'MENU_TITLE.AUDIT_UPLOAD_REQUEST',
            link: 'audit.upload_request',
            disabled: lsAppConfig.production
          }
        ]
      };

      var tabs = [home, files, groups, administrations, uploads, others];

      // Public API here
      return {
        getAvailableTabs: function() {
          $log.debug('Menu:getAvailableTabs');
          return tabs;
        },
        getProperties: function (currentState) {

          //to remove: if
          if (currentState.indexOf('transfert') > -1  || currentState.indexOf('documents') > -1 ) {
            return {
              color: '#2196F3'
            };
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
