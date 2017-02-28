/**
 * MenuService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('MenuService', menuService);

  menuService.$inject = ['lsAppConfig'];

  /**
   * @namespace menuService
   * @desc Service to interact with session
   * @memberOf linshareUiUserApp
   */
  function menuService(lsAppConfig) {
    var
      administrations,
      audit,
      files,
      home,
      myUploads,
      sharedSpace,
      tabs,
      uploads,
      service = {
        getAvailableTabs: getAvailableTabs,
        getProperties: getProperties
      };

    activate();

    return service;

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function activate() {
      administrations = {
        name: 'MENU_TITLE.ADMIN',
        icon: 'zmdi zmdi-settings-square',
        color: '#E91E63',
        disabled: false,
        links: [
          {
            name: 'MENU_TITLE.CONTACTS_LISTS',
            link: 'administration.contactslists',
            disabled: false
          }, {
            name: 'MENU_TITLE.GUESTS',
            link: 'administration.guests',
            disabled: false
          }, {
            name: 'MENU_TITLE.USERS',
            link: 'administration.users',
            disabled: lsAppConfig.production
          }, {
            name: 'MENU_TITLE.GROUP_MEMBERS',
            link: 'administration.groups',
            disabled: lsAppConfig.production
          }
        ]
      };

      audit = {
        name: 'MENU_TITLE.AUDIT',
        link: 'audit.global',
        icon: 'zmdi zmdi-time-restore',
        color: '#FFC107',
        disabled: false
      };

      files = {
        name: 'MENU_TITLE.FILES',
        icon: 'zmdi zmdi-account',
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

      home = {
        name: 'MENU_TITLE.HOME',
        link: 'home',
        icon: 'zmdi zmdi-home',
        color: '#05B1FF',
        disabled: false
      };

      myUploads = {
        name: 'MENU_TITLE.UPLOAD_AND_SHARE',
        link: 'documents.upload',
        icon: 'zmdi zmdi-upload',
        color: '#05B1FF',
        disabled: false
      };

      sharedSpace = {
        name: 'MENU_TITLE.SHARED_SPACE',
        link: 'sharedspace.all',
        icon: 'groups-home-workgroup',
        color: '#05B1FF',
        disabled: false
      };

      uploads = {
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

      tabs = [home, myUploads, files, sharedSpace, administrations, uploads, audit];
    }

    /**
     * @name getAvailableTabs
     * @desc Get available tabs
     * @returns {Array} Array of tabs
     * @memberOf linshareUiUserApp.menuService
     */
    function getAvailableTabs() {
      return tabs;
    }

    /**
     * @name getProperties
     * @desc Get each menu's properties
     * @param {String} currentState - Current state's name
     * @param {Boolean} isSubMenu - Is menu of sub menu
     * @returns {Promise} Selected menu's properties
     * @memberOf linshareUiUserApp.menuService
     */
    function getProperties(currentState, isSubMenu) {
      if (!isSubMenu) {
        if (currentState.indexOf('transfert') > -1 || currentState.indexOf('documents') > -1) {
          return {
            color: '#2196F3'
          };
        }
      }

      var selectedMenu = null;
      _.forEach(tabs, function(tab) {
        if (!_.isUndefined(tab.links)) {
          _.forEach(tab.links, function(link) {
            if (link.link === currentState) {
              selectedMenu = isSubMenu ? link : tab;
            }
          });
        } else if (tab.link === currentState) {
          selectedMenu = tab;
        }
      });
      return selectedMenu;
    }
  }
})();
