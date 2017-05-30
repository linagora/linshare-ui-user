/**
 * lsGuestForm Directive
 * @namespace LinShare.guests
 */
(function() {
  'use strict';

  angular
    .module('linshare.guests')
    .directive('lsGuestForm', lsGuestForm);

  lsGuestForm.$inject = ['_'];

  /**
   *  @namespace lsGuestForm
   *  @desc Form for creating/updating a Guest object
   *  @example <div ls-guest-form></div>
   *  @memberOf LinShare.components
   */
  function lsGuestForm(_) {
    var directive = {
      restrict: 'A',
      scope: {
        formName: '=',
        guestObject: '='
      },
      templateUrl: 'modules/linshare.guests/directives/guest-form/guest-form.html',
      link: linkFn,
      replace: true,
      transclude: true
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc link function of the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @memberOf LinShare.components.lsAutocompleteUsers
     */
    function linkFn(scope) {
      scope.formName = _.isUndefined(scope.formName) ?
                        'guestForm' + Math.random().toString(36).match(/[a-z]+/g).join('') : scope.formName;
      scope.linshareModeProduction = scope.$root.linshareModeProduction;
    }
  }
})();
