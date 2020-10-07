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
    '$log',
    'authenticationRestService',
    'functionalityRestService',
    'lsAppConfig'
  ];

  /**
   * @namespace menuService
   * @desc Service to interact with session
   * @memberOf linshareUiUserApp
   */
  function menuService(
    _,
    $q,
    $log,
    authenticationRestService,
    functionalityRestService,
    lsAppConfig
  ) {
    var
      administrations,
      audit,
      changePassword,
      externalLink,
      files,
      home,
      myUploads,
      sharedSpace,
      tabs,
      receivedShares,
      safeDetails,
      uploads,
      uploadRequests,
      secondFactorAuthentication,
      service = {
        build: build,
        getAvailableTabs: getAvailableTabs,
        getProperties: getProperties
      };

    const contactsListMenuName = 'MENU_TITLE.CONTACTS_LISTS';
    const guestMenuName = 'MENU_TITLE.GUESTS';
    const filesMenuName = 'MENU_TITLE.FILES';
    const receivedShareMenuName = 'MENU_TITLE.RECEIVED_SHARES';
    const myUploadMenuName = 'MENU_TITLE.UPLOAD_AND_SHARE';
    const sharedSpaceMenuName = 'MENU_TITLE.SHARED_SPACE';
    const changePasswordMenuName = 'MENU_TITLE.CHANGE_PASSWORD';
    const secondFactorAuthenticationMenuName = 'SECOND_FACTOR_AUTH.TITLE';
    const uploadRequestsMenuName = 'UPLOAD_REQUESTS.TITLE';

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
            name: contactsListMenuName,
            link: 'administration.contactslists.list',
            hide: !lsAppConfig.menuLinks.disable[contactsListMenuName] && !functionalities.CONTACTS_LIST.enable,
            disabled: lsAppConfig.menuLinks.disable[contactsListMenuName] && !functionalities.CONTACTS_LIST.enable,
            suffix: lsAppConfig.menuLinks.suffix,
            suffixLink: lsAppConfig.menuLinks.suffixLink
          }, {
            name: guestMenuName,
            link: 'administration.guests',
            hide: !lsAppConfig.menuLinks.disable[guestMenuName] &&
              _.isNil(functionalities.GUESTS) ? true : !(functionalities.GUESTS.enable && user.canCreateGuest),
            disabled: lsAppConfig.menuLinks.disable[guestMenuName] &&
              _.isNil(functionalities.GUESTS) ? true : !(functionalities.GUESTS.enable && user.canCreateGuest),
            suffix: lsAppConfig.menuLinks.suffix,
            suffixLink: lsAppConfig.menuLinks.suffixLink
          });

          administrations.hide = _.reduce(administrations.links, function(value, link){
            return link.hide && value;
          }, true);
          administrations.disabled = _.reduce(administrations.links, function(value, link){
            return link.disabled && value;
          }, true);

          files.hide = !lsAppConfig.menuLinks.disable[filesMenuName] && !user.canUpload;
          files.disabled = lsAppConfig.menuLinks.disable[filesMenuName] && !user.canUpload;

          sharedSpace.hide = !lsAppConfig.menuLinks.disable[sharedSpaceMenuName] &&
            !functionalities.WORK_GROUP.enable;
          sharedSpace.disabled = lsAppConfig.menuLinks.disable[sharedSpaceMenuName] &&
            !functionalities.WORK_GROUP.enable;

          myUploads.hide = !lsAppConfig.menuLinks.disable[myUploadMenuName] &&
            !(functionalities.WORK_GROUP.enable || user.canUpload);
          myUploads.disabled = lsAppConfig.menuLinks.disable[myUploadMenuName] &&
            !(functionalities.WORK_GROUP.enable || user.canUpload);

          receivedShares.hide = !lsAppConfig.menuLinks.disable[receivedShareMenuName] &&
            functionalities.ANONYMOUS_URL__HIDE_RECEIVED_SHARE_MENU.enable;
          receivedShares.disabled = lsAppConfig.menuLinks.disable[receivedShareMenuName] &&
            functionalities.ANONYMOUS_URL__HIDE_RECEIVED_SHARE_MENU.enable;

          uploadRequests.hide = !functionalities.UPLOAD_REQUEST.enable;
        }).catch(function(error) {
          $log.debug(error);
        });

      administrations = {
        name: 'MENU_TITLE.ADMIN',
        icon: 'ls-user-group',
        color: '#E91E63',
        hide: false,
        links: [],
        suffix: lsAppConfig.menuLinks.suffix,
        suffixLink: lsAppConfig.menuLinks.suffixLink
      };

      audit = {
        name: 'MENU_TITLE.AUDIT',
        link: 'audit.global',
        icon: 'zmdi zmdi-time-restore',
        color: '#FFC107',
        hide: false
      };

      externalLink = {
        name: lsAppConfig.extLink.name,
        href: lsAppConfig.extLink.href,
        icon: lsAppConfig.extLink.icon,
        color: '#FFC107',
        hide: !lsAppConfig.extLink.enable,
        newTab: lsAppConfig.extLink.newTab
      };

      files = {
        name: filesMenuName,
        icon: 'ls-my-space',
        hide: false,
        link: 'documents.files',
        suffix: lsAppConfig.menuLinks.suffix,
        suffixLink: lsAppConfig.menuLinks.suffixLink
      };

      receivedShares = {
        name: receivedShareMenuName,
        icon: 'ls-received-shares',
        hide: false,
        link: 'documents.received',
        suffix: lsAppConfig.menuLinks.suffix,
        suffixLink: lsAppConfig.menuLinks.suffixLink
      };

      secondFactorAuthentication = {
        name: secondFactorAuthenticationMenuName,
        link: 'secondFactorAuthentication',
        hide: true
      };

      changePassword = {
        name: changePasswordMenuName,
        link: 'changePassword',
        hide: true
      };

      home = {
        name: 'MENU_TITLE.HOME',
        link: 'home',
        icon: 'ls-homepage',
        hide: false
      };

      myUploads = {
        name: myUploadMenuName,
        link: 'documents.upload',
        icon: 'ls-uploads',
        suffix: lsAppConfig.menuLinks.suffix,
        suffixLink: lsAppConfig.menuLinks.suffixLink
      };

      sharedSpace = {
        name: sharedSpaceMenuName,
        link: 'sharedspace.all',
        icon: 'ls-workgroup',
        hide: false,
        suffix: lsAppConfig.menuLinks.suffix,
        suffixLink: lsAppConfig.menuLinks.suffixLink
      };

      safeDetails = {
        name: 'MENU_TITLE.SAFE_DETAILS',
        link: 'safe_details.global',
        icon: 'zmdi zmdi-card',
        hide: !lsAppConfig.enableSafeDetails
      };

      uploads = {
        name: 'MENU_TITLE.UPLOAD_MANAGMENT',
        icon: 'ls-upload-request',
        hide: lsAppConfig.production,
        links: [{
          name: 'MENU_TITLE.UPLOAD_PROPOSITIONS',
          link: 'upload_request.propositions',
          hide: lsAppConfig.production
        }, {
          name: 'MENU_TITLE.UPLOAD_REQUESTS',
          link: 'upload_request.requests',
          hide: lsAppConfig.production
        }]
      };

      uploadRequests = {
        name: uploadRequestsMenuName,
        links: [{
          name: 'UPLOAD_REQUESTS.MENU_ENTRIES.PENDING',
          link: 'uploadRequests({ status: "pending" })',
          state: 'uploadRequests',
          params: {
            status: 'pending'
          }
        }, {
          name: 'UPLOAD_REQUESTS.MENU_ENTRIES.ACTIVE_CLOSED',
          link: 'uploadRequests({ status: "activeClosed" })',
          state: 'uploadRequests',
          params: {
            status: 'activeClosed'
          }
        }, {
          name: 'UPLOAD_REQUESTS.MENU_ENTRIES.ARCHIVES',
          link: 'uploadRequests({ status: "archived" })',
          state: 'uploadRequests',
          params: {
            status: 'archived'
          }
        }],
        icon: 'zmdi zmdi-pin-account',
        hide: false
      };

      tabs = [
        changePassword,
        myUploads,
        receivedShares,
        files,
        sharedSpace,
        administrations,
        uploadRequests,
        uploads,
        audit,
        safeDetails,
        secondFactorAuthentication,
        externalLink
      ];

      if (!lsAppConfig.hideHomeMenuLink) {
        tabs.unshift(home);
      }
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
    function getProperties(currentState, isSubMenu, toParams) {
      var selectedMenu = null;

      _.forEach(tabs, function(tab) {
        if (!_.isUndefined(tab.links)) {
          _.forEach(tab.links, function(link) {
            let hasIdenticalParams;

            if (link.params) {
              hasIdenticalParams = !Object.keys(link.params).some(field => link.params[field] !== toParams[field]);
            }
            if (link.link === currentState || (link.state === currentState && hasIdenticalParams)) {
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
