/**
 * MenuService factory
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .factory('MenuService', menuService);

  menuService.$inject = [
    '_',
    '$q',
    'authenticationRestService',
    'functionalityRestService',
    'lsAppConfig',
    'lsColors'
  ];

  /**
   * @namespace menuService
   * @desc Service to interact with session
   * @memberOf linshareUiUserApp
   */
  function menuService(
    _,
    $q,
    authenticationRestService,
    functionalityRestService,
    lsAppConfig,
    lsColors
  ) {
    var
      administrations,
      audit,
      externalLink,
      files,
      home,
      myUploads,
      sharedSpace,
      tabs,
      receivedShares,
      safeDetails,
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
      $q
        .all([
          authenticationRestService.getCurrentUser(),
          functionalityRestService.getAll()
        ])
        .then(function(promises) {
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
            disabled: _.isNil(functionalities.GUESTS) ? true : !(functionalities.GUESTS.enable && user.canCreateGuest)
          });

          administrations.disabled = _.reduce(administrations.links, function(value, link){
            return link.disabled && value;
          }, true);

          files.disabled = !user.canUpload;

          sharedSpace.disabled = !functionalities.WORK_GROUP.enable;
          myUploads.disabled = !(functionalities.WORK_GROUP.enable || user.canUpload);
          receivedShares.disabled = functionalities.ANONYMOUS_URL__HIDE_RECEIVED_SHARE_MENU.enable;
        });

      administrations = {
        name: 'MENU_TITLE.ADMIN',
        icon: 'ls-user-group',
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

      externalLink = {
        name: lsAppConfig.extLink.name,
        href: lsAppConfig.extLink.href,
        icon: lsAppConfig.extLink.icon,
        color: '#FFC107',
        disabled: !lsAppConfig.extLink.enable,
        newTab: lsAppConfig.extLink.newTab
      };

      files = {
        name: 'MENU_TITLE.FILES',
        icon: 'ls-my-space',
        color: '#2196F3',
        disabled: false,
        link: 'documents.files'
      };

      receivedShares = {
        name: 'MENU_TITLE.RECEIVED_SHARES',
        icon: 'ls-received-shares',
        color: '#2196F3',
        disabled: false,
        link: 'documents.received'
      };

      home = {
        name: 'MENU_TITLE.HOME',
        link: 'home',
        icon: 'ls-homepage',
        color: lsColors.PRIMARY_BLUE,
        disabled: false
      };

      myUploads = {
        name: 'MENU_TITLE.UPLOAD_AND_SHARE',
        link: 'documents.upload',
        icon: 'ls-uploads',
        color: lsColors.PRIMARY_BLUE
      };

      sharedSpace = {
        name: 'MENU_TITLE.SHARED_SPACE',
        link: 'sharedspace.all',
        icon: 'ls-workgroup',
        color: lsColors.PRIMARY_BLUE,
        disabled: false
      };

      safeDetails = {
        name: 'MENU_TITLE.SAFE_DETAILS',
        link: 'safe_details.global',
        icon: 'zmdi zmdi-card',
        color: '#FFC107',
        disabled: !lsAppConfig.enableSafeDetails
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

      tabs = [
        home,
        myUploads,
        receivedShares,
        files,
        sharedSpace,
        administrations,
        uploads,
        audit,
        safeDetails,
        externalLink
      ];
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
