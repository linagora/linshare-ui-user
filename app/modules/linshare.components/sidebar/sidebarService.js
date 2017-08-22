/**
 * languageService Factory
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
      toggle: toggle,
      show: show,
      hide: hide,
      isVisible: isVisible
    };

    return sidebar;

    ////////////

    function setContent(content) {
      sidebar.content = content;
    }

    function getContent() {
      return sidebar.content;
    }

    function setData(data) {
      sidebar.data = data;
    }

    function getData() {
      return sidebar.data;
    }

    function addData(key, value) {
      sidebar.data[key] = value;
    }

    function removeData(key) {
      delete sidebar.data[key];
    }

    function toggle() {
      sidebar.visible = !sidebar.toggle;
    }

    function show() {
      sidebar.visible = true;
    }

    function hide(form, obj) {
      sidebar.visible = false;
      sidebar.setContent(null);
      if (obj && !_.isUndefined(obj.reset)) {
        obj.reset();
      }
    }

    function isVisible() {
      return sidebar.visible;
    }
  }
})();
