/**
 * lsAutocompleteUser Directive
 * @namespace LinShare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .directive('lsAutocompleteUser', lsAutocompleteUser);

  lsAutocompleteUser.$inject = ['_', 'componentsConfig'];

  /**
   *  @namespace lsAutocompleteUser
   *  @desc Autompletion for searching a type of user and add it to a list on selection
   *  @example <div ls-autocomplete-user></div>
   *  @memberOf LinShare.components
   */
  /**TODO - KLE: This directive should be surround by the following tag, have to test for every case we use it
   * <x-ng-form name="editors" role="form" class="clearfix">
   *   <div class="form-group fg-line">
   */
  function lsAutocompleteUser(_, componentsConfig) {
    var directive = {
      restrict: 'A',
      scope: {
        isRequired: '=?',
        onSelectFunction: '=',
        selectedUsersList: '=',
        withEmail: '=?',
        withGuest: '=?'
      },
      template: require('./autocompleteTemplate.html'),
      controller: 'AutocompleteUsersController',
      controllerAs: 'autocompleteUsersVm',
      bindToController: true,
      link: linkFn,
      replace: true,
      require: '^form'
    };

    return directive;

    /**
     *  @name linkFn
     *  @desc link function of the directive
     *  @param {Object} scope - Angular scope object of the directive
     *  @param {Object} elm - jqLite-wrapped element that this directive matches
     *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
     *  @param {Object} form - Directive's required controller instance(s)
     *  @memberOf LinShare.components.lsAutocompleteUsers
     */
    function linkFn(scope, elm, attrs, form) {
      scope.autocompleteUsersVm.name = 'focusInputShare' + Math.random().toString(36).match(/[a-z]+/g).join('');
      scope.autocompleteUsersVm.form = form;
      scope.autocompleteUsersVm.withEmail =
        (_.isUndefined(scope.autocompleteUsersVm.withEmail)) ? true : scope.autocompleteUsersVm.withEmail;
      scope.completeType = attrs.lsAutocompleteUser;
      scope.completeThreadUuid = attrs.lsCompleteThreadUuid;
      elm.bind('keypress', function(event) {
        scope.completeThreadUuid = attrs.lsCompleteThreadUuid;
        if (event.keyCode === 13) {
          if (!scope.noResult || scope.autocompleteUsersVm.withEmail) {
            scope.autocompleteUsersVm.onSelect();
          }
        }
      });
    }
  }
})();
