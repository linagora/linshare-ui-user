/**
 * ownerLabel Directive
 * @namespace linshare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('ownerLabel', ownerLabel);

  ownerLabel.$inject = ['ownerLabel'];

  /**
   * @namespace ownerLabel
   * @desc Manage the render of an element owner
   * @example
   * <div owner-label
   *      owner-label-user="{firstName: list.ownerFirstName, lastName: list.ownerLastName, mail: list.ownerMail}"></div>
   * <div owner-label
   *      owner-label-user="{firstName: list.ownerFirstName, lastName: list.ownerLastName, mail: list.ownerMail}"
   *      owner-label-attr="title"></div>
   * @memberOf linshare.components
   */
  function ownerLabel(ownerLabel) {
    var directive = {
      restrict: 'A',
      scope: {
        /*
         * @property {Object} ownerLabelUser - Object containing user information
         * @property {Object} ownerLabelUser.firstName - First name of the user
         * @property {Object} ownerLabelUser.lastName - Last name of the user
         * @property {Object} ownerLabelUser.mail - Email of the user
         */
        ownerLabelUser: '=',
        /*
         * If not setted will put the value between the tag, else for the attribute
         */
        ownerLabelAttr: '@?'
      },
      link: linkFn
    };
    return directive;

    ///////////

    /**
     *  @name linkFn
     *  @desc DOM manipulation function, relared to the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} elm - jqLite-wrapped element that this directive matches
     *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
     *  @memberOf LinShare.components.ownerLabel
     */
    function linkFn(scope, elm, attrs) {
      var label = ownerLabel.getOwner(scope.ownerLabelUser);
      if (_.isNil(scope.ownerLabelAttr)) {
        elm.text(label);
      } else {
        if (_.isNil(attrs[_.camelCase(scope.ownerLabelAttr)])) {
          elm.attr(scope.ownerLabelAttr, label);
        } else {
          attrs[_.camelCase(scope.ownerLabelAttr)] = label;
        }
      }
    }
  }
})();
