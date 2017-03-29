/**
 * fileSystemUtils Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('fileSystemUtils', fileSystemUtils);

  fileSystemUtils.$inject = ['lsAppConfig']

  /**
   * @namespace fileSystemUtils
   * @desc Utils service for manipulating file
   * @memberOf linshare.components
   */
  function fileSystemUtils(lsAppConfig) {
    var service = {
      isNameValid: isNameValid
    };
    return service;

    ////////////

    /**
     * @name isNameValid
     * @desc Determine if a given object has a valid name for a file system,
     *       not containing any restricted characters
     * @param {string} name - The name of the object to valid
     * @returns {boolean} if the name is valid or not
     * @memberOf linshare.components.fileSystemUtils
     */
    function isNameValid(name) {
      if (name.charAt(name.length - 1) === '.') {
        return false;
      }
      var regex = new RegExp('[\\'+ lsAppConfig.rejectedChar.join('-').replace(new RegExp('-', 'g'), '\\') + ']');
      return !regex.test(name);
    }
  }
})();
