/**
 * MenuService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('MenuService', menuService);

  menuService.$inject = ['$q', 'authenticationRestService', 'functionalityRestService', 'lsAppConfig'];

  /**
   * @namespace menuService
   * @desc Service to interact with session
   * @memberOf linshareUiUserApp
   */
  function menuService($q, authenticationRestService, functionalityRestService, lsAppConfig) {
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
        build: build,
        getAvailableTabs: getAvailableTabs,
        getProperties: getProperties
      };

    return service;

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.contactsLists.contactsListsContactsController
     */
    function build() {
      $q.all([authenticationRestService.getCurrentUser(), functionalityRestService.getAll()]).then(function(promises) {
        var
          user = promises[0],
          functionalities = promises[1];

        administrations.links.splice(0, 0, {
          name: 'MENU_TITLE.CONTACTS_LISTS',
          link: 'administration.contactslists.list',
          disabled: !functionalities.CONTACTS_LIST.enable
        }, {
          name: 'MENU_TITLE.GUESTS',
          link: 'administration.guests',
          disabled: _.isNil(functionalities.GUESTS) ? true : !functionalities.GUESTS.enable && user.canCreateGuest
        });

        files.links.splice(0, 0, {
          name: 'MENU_TITLE.MY_FILES',
          link: 'documents.files',
          disabled: !user.canUpload
        });

        sharedSpace.disabled = !functionalities.WORK_GROUP.enable;
        myUploads.disabled = !(functionalities.WORK_GROUP.enable || user.canUpload);
      });

      administrations = {
        name: 'MENU_TITLE.ADMIN',
        icon: 'ls-settings',
        color: '#E91E63',
        disabled: false,
        links: [{
          name: 'MENU_TITLE.USERS',
          link: 'administration.users',
          disabled: lsAppConfig.production
        }, {
          name: 'MENU_TITLE.GROUP_MEMBERS',
          link: 'administration.groups',
          disabled: lsAppConfig.production
        }]
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
        icon: 'ls-my-space',
        color: '#2196F3',
        disabled: false,
        links: [{
          name: 'MENU_TITLE.RECEIVED_SHARES',
          link: 'documents.received',
          disabled: false
        }, {
          name: 'MENU_TITLE.SHARES',
          link: 'documents.shared',
          disabled: true
        }]
      };

      home = {
        name: 'MENU_TITLE.HOME',
        link: 'home',
        icon: 'ls-homepage',
        color: '#05B1FF',
        disabled: false
      };

      myUploads = {
        name: 'MENU_TITLE.UPLOAD_AND_SHARE',
        link: 'documents.upload',
        icon: 'ls-uploads',
        color: '#05B1FF',
      };

      sharedSpace = {
        name: 'MENU_TITLE.SHARED_SPACE',
        link: 'sharedspace.all',
        icon: 'ls-shared-space',
        color: '#05B1FF',
        disabled: false
      };

      uploads = {
        name: 'MENU_TITLE.UPLOAD_MANAGMENT',
        icon: 'ls-upload-request',
        color: '#8BC34A',
        disabled: lsAppConfig.production,
        links: [{
          name: 'MENU_TITLE.UPLOAD_PROPOSITIONS',
          link: 'upload_request.propositions',
          disabled: lsAppConfig.production
        }, {
          name: 'MENU_TITLE.UPLOAD_REQUESTS',
          link: 'upload_request.requests',
          disabled: lsAppConfig.production
        }]
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
