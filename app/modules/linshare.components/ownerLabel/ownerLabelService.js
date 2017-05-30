/**
 * ownerLabel Factory
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .factory('ownerLabel', ownerLabel);

  ownerLabel.$inject = ['_', '$q', '$translate', 'authenticationRestService'];

  /**
   * @namespace ownerLabel
   * @desc Service to manage owner value of element
   * @memberOf NameSpaceGlobal
   */
  function ownerLabel(_, $q, $translate, authenticationRestService) {
    var by,
      currentUser,
      me,
      service = {
        getOwner: getOwner
      };

    fetch();

    return service;

    /**
     * @name fetch
     * @desc Fetch necessary data for this service to work
     * @memberOf linshare.components.ownerLabel
     */
    function fetch() {
      $q.all([authenticationRestService.getCurrentUser(), $translate(['BY', 'ME'])]).then(function(promises) {
        currentUser = promises[0];
        by = promises[1].BY;
        me = promises[1].ME;
      });
    }

    /**
     * @name getOwner
     * @desc Get the owner value of an element in the form of : 'By <first name + last name | Me>'.
     * @param {Object} user - User object containing basic info: firstName, lastName, mail.
     * @returns {string} the owner value of the element.
     * @memberOf linshare.components.ownerLabel
     */
    function getOwner(user) {
      if (_.isNil(user.mail)) {
        return _.isEqual(_.pick(currentUser, ['firstName', 'lastName']), user) ?
          by + ' ' + me : by + ' ' + user.firstName + ' ' + user.lastName;
      }
      return _.isEqual(_.pick(currentUser, ['firstName', 'lastName', 'mail']), user) ?
        by + ' ' + me : by + ' ' + user.firstName + ' ' + user.lastName;
    }
  }
})();
