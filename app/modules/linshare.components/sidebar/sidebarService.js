/**
 * sidebarService Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('sidebarService', sidebarService);

  sidebarService.$inject = ['_'];

  /**
   * @name sidebarService
   * @desc Service to manipulate sidebar
   * @memberOf linshareUiUserApp
   */
  function sidebarService(_) {
    var sidebar = {
      visible: false,
      content: '',
      data: {},
      setContent: setContent,
      getContent: getContent,
      setData: setData,
      getData: getData,
      addData: addData,
      removeData: removeData,
      show: show,
      hide: hide,
      isVisible: isVisible
    };

    return sidebar;

    ////////////

    /**
     * @name setContent
     * @desc Set the view to display
     * @param {string} content - Name of the view to display
     * @memberOf linshareUiUserApp.sidebarService
     */
    function setContent(content) {
      sidebar.content = content;
    }

    /**
     * @name getContent
     * @desc Get the name of the view displayed
     * @memberOf linshareUiUserApp.sidebarService
     */
    function getContent() {
      return sidebar.content;
    }

    /**
     * @name setData
     * @desc Set datas to use in the sidebar
     * @param {object} data - Datas which will be used in the view
     * @memberOf linshareUiUserApp.sidebarService
     */
    function setData(data) {
      sidebar.data = data;
    }

    /**
     * @name getData
     * @desc Get data used in the sidebar
     * @returns {object} Datas used in the sidebar
     * @memberOf linshareUiUserApp.sidebarService
     */
    function getData() {
      return sidebar.data;
    }

    /**
     * @name addData
     * @desc Append data to the object used in the sidebar
     * @param {object} key - Key of the data to add
     * @param {object} value - Value of the data to add
     * @memberOf linshareUiUserApp.sidebarService
     */
    function addData(key, value) {
      sidebar.data[key] = value;
    }

    /**
     * @name removeData
     * @desc Remove data from the object used in the sidebar
     * @param {object} key - Key of the data to remove
     * @memberOf linshareUiUserApp.sidebarService
     */
    function removeData(key) {
      delete sidebar.data[key];
    }

    /**
     * @name show
     * @desc Open the sidebar
     * @memberOf linshareUiUserApp.sidebarService
     */
    function show() {
      sidebar.visible = true;
    }

    /**
     * @name hide
     * @desc Hide the sidebar
     * @param {object} [obj] - Reset the object if defined with reset() function
     * @memberOf linshareUiUserApp.sidebarService
     */
    function hide(obj) {
      sidebar.visible = false;
      sidebar.setContent(null);
      if (obj && !_.isUndefined(obj.reset)) {
        obj.reset();
      }
    }

    /**
     * @name isVisible
     * @desc Check if sidebar is opened
     * @returns {boolean}
     * @memberOf linshareUiUserApp.sidebarService
     */
    function isVisible() {
      return sidebar.visible;
    }
  }
})();
