/**
 * AutocompleteUsersController Controller
 * @namespace LinShare.components
 */
(function() {
  'use strict';

  angular
    .module('linshare.components')
    .controller('AutocompleteUsersController', AutocompleteUsersController);

  AutocompleteUsersController.$inject = ['_', '$log', '$q', '$scope', 'authenticationRestService',
    'autocompleteUserRestService', 'functionalityRestService', 'lsAppConfig', 'ownerLabel'
  ];

  /**
   * @namespace AutocompleteUsersController
   * @desc Controller of the directive ls-autocomplete-users
   * @memberOf LinShare.components
   */
  function AutocompleteUsersController(_, $log, $q, $scope, authenticationRestService, autocompleteUserRestService,
    functionalityRestService, lsAppConfig, ownerLabel) {
    var autocompleteUsersVm = this;
    var regexpEmail = /^\S+@\S+\.\S+$/;

    autocompleteUsersVm.dealWithSelectedUser = autocompleteUsersVm.onSelectFunction || addElements;
    autocompleteUsersVm.isEmail = true;
    autocompleteUsersVm.onErrorEmail = onErrorEmail;
    autocompleteUsersVm.onErrorEmpty = onErrorEmpty;
    autocompleteUsersVm.onSelect = onSelect;
    autocompleteUsersVm.required = required;
    autocompleteUsersVm.searchUsersAccount = searchUsersAccount;
    autocompleteUsersVm.userRepresentation = userRepresentation;

    activate();

    ////////////

    /**
     * @namespace activate
     * @desc Activation function of the controller launch at every instantiation
     * @memberOf LinShare.components.AutocompleteUsersController
     */
    function activate() {
      $q.all([functionalityRestService.getFunctionalityParams('COMPLETION'),
        authenticationRestService.getCurrentUser()
      ]).then(function(promises) {
        autocompleteUsersVm.functionality = promises[0];
        autocompleteUsersVm.functionality.value = autocompleteUsersVm.functionality.value || 3;
        if (promises[1].accountType === lsAppConfig.accountType.guest && promises[1].restricted) {
          autocompleteUsersVm.withEmail = false;
        }
      });
    }

    /**
     *  @name addElements
     *  @desc Add User Object to the given list
     *  @memberOf LinShare.components.AutocompleteUsersController
     */
    //TODO - REFACTOR: This function should always be used, but used custom one form shareObject or guestObject
    //                 And retun the list of object. This will avoid duplicating code.
    function addElements() {
      var
        exists = false,
        selectedUser = autocompleteUsersVm.selectedUser,
        selectedUsersList = autocompleteUsersVm.selectedUsersList;

      var errors = handleErrors();
      if (errors) {
        $log.error('Error in Function addElements:' + errors);
        return;
      }

      switch (selectedUser.type) {
        case 'simple':
          angular.forEach(selectedUsersList, function(elem) {
            if (elem.mail === selectedUser.identifier) {
              exists = true;
              $log.info('The user ' + selectedUser.identifier + ' is already in the selected user list list');
            }
          });
          if (!exists) {
            selectedUser.mail = selectedUser.identifier;
            selectedUsersList.push(_.omit(selectedUser, 'selectedUsersList', 'type', 'display', 'identifier'));
          }
          break;
        case 'user':
          angular.forEach(selectedUsersList, function(elem) {
            if (elem.mail === selectedUser.mail && elem.domain === selectedUser.domain) {
              exists = true;
              $log.info('The user ' + selectedUser.mail + ' is already in the selected user list list');
            }
          });
          if (!exists) {
            selectedUsersList.push(_.omit(selectedUser, 'selectedUsersList', 'uuid', 'type', 'display', 'identifier'));
          }
          break;
        case 'mailinglist':
          angular.forEach(selectedUsersList, function(element) {
            if (element.identifier === selectedUser.identifier) {
              exists = true;
              $log.info('The list ' + selectedUser.listName + ' is already in the mailinglist');
            }
          });
          if (!exists) {
            selectedUsersList.push(_.omit(selectedUser, 'display', 'identifier'));
          }
          break;
      }

      /**
       * @name handleErrors
       * @desc Error management for addElements
       * @returns {String} error message if there is one
       * @memberOf LinShare.components.AutocompleteUsersController.addElements
       */
      function handleErrors() {
        var errorMsg = '';
        if (_.isUndefined(selectedUser)) {
          errorMsg += '\n\t- var selectedUser is not defined';
        }
        if (_.isUndefined(selectedUsersList)) {
          errorMsg += '\n\t- var selectedUsersList is not defined';
        }
        return errorMsg;
      }
    }

    /**
     *  @name onErrorEmail
     *  @desc Evaluate if the element is on error because of an invalid email
     *  @returns {Boolean}
     *  @memberOf LinShare.components.AutocompleteUsersController
     */
    function onErrorEmail() {
      var viewValue = autocompleteUsersVm.form[autocompleteUsersVm.name].$viewValue;
      if (autocompleteUsersVm.withEmail && autocompleteUsersVm.noResult && !_.isUndefined(viewValue)) {
        if (viewValue.length >= autocompleteUsersVm.functionality.value) {
          return !regexpEmail.test(viewValue);
        }
      }
      return false;
    }

    /**
     *  @name onErrorEmpty
     *  @desc Evaluate if the element is on error because of an empty list
     *  @returns {Boolean}
     *  @memberOf LinShare.components.AutocompleteUsersController
     */
    function onErrorEmpty() {
      if (!_.isUndefined(autocompleteUsersVm.form[autocompleteUsersVm.name])) {
        return ((autocompleteUsersVm.form[autocompleteUsersVm.name].$touched || autocompleteUsersVm.form.$submitted) &&
          autocompleteUsersVm.form[autocompleteUsersVm.name].$invalid && autocompleteUsersVm.required());
      }
    }

    /**
     *  @name onSelect
     *  @desc Evalutate if user exists
     *  @memberOf LinShare.components.AutocompleteUsersController
     */
    function onSelect() {
      if (autocompleteUsersVm.selectedUser) {
        autocompleteUsersVm.dealWithSelectedUser(autocompleteUsersVm.selectedUser,
          autocompleteUsersVm.selectedUsersList);
      } else {
        var viewValue = autocompleteUsersVm.form[autocompleteUsersVm.name].$viewValue;
        if (autocompleteUsersVm.withEmail) {
          if (regexpEmail.test(viewValue)) {
            autocompleteUsersVm.searchUsersAccount(viewValue)
              .then(function(data) {
                autocompleteUsersVm.selectedUser = data[0];
                autocompleteUsersVm.dealWithSelectedUser(autocompleteUsersVm.selectedUser,
                  autocompleteUsersVm.selectedUsersList);
              });
          } else {
            autocompleteUsersVm.isEmail = !autocompleteUsersVm.onErrorEmail();
          }
        }
      }
    }

    /**
     *  @name required
     *  @desc Evaluate if the field should be required
     *  @returns {Boolean}
     *  @memberOf LinShare.components.AutocompleteUsersController
     */
    function required() {
      if (!_.isUndefined(autocompleteUsersVm.selectedUsersList) && !_.isUndefined(autocompleteUsersVm.isRequired)) {
        return (autocompleteUsersVm.selectedUsersList.length === 0 && autocompleteUsersVm.isRequired);
      }
    }

    /**
     *  @name searchUsersAccount
     *  @desc Call the rest service to get User
     *  @param {String} pattern - The user pattern to seach for
     *  @returns {Array<Object>} A collection of 0-n User object
     *  @memberOf LinShare.components.AutocompleteUsersController
     */
    function searchUsersAccount(pattern) {
      var deferred = $q.defer();
      if (pattern.length >= autocompleteUsersVm.functionality.value) {
        autocompleteUserRestService.search(pattern, $scope.completeType, $scope.completeThreadUuid)
          .then(function(data) {
            // TODO : IAB : strong email validation (for this one and all other)
            if (data.length === 0 && autocompleteUsersVm.withEmail && regexpEmail.test(pattern)) {
              data.push({
                mail: pattern,
                identifier: pattern,
                type: 'simple'
              });
            }
            autocompleteUsersVm.isEmail = !autocompleteUsersVm.onErrorEmail();
            deferred.resolve(data);
          });
      }
      return deferred.promise;
    }

    /**
     *  @name userRepresentation
     *  @desc Format the template to show depending on the user type
     *  @param {Object} data - response object reprenseting a User object
     *  @returns {String} A template
     *  @memberOf LinShare.components.AutocompleteUsersController
     */
    function userRepresentation(data) {
      var template = '' +
        '<div  class="recipientsAutocomplete" title="$title">' +
        '<span class="firstLetterFormat $style">$firstLetter</span>' +
        '<p class="recipientsInfo">' +
        '<span class="user-full-name">$name</span>' +
        '<span class="email">$info</span>' +
        '</p>' +
        '</div>';
      switch (data.type) {
        case 'simple':
          template = data.identifier;
          break;
        case 'mailinglist':
          var user = {
            firstName: data.ownerFirstName,
            lastName: data.ownerLastName,
            mail: data.ownerMail
          };
          template = template
            .replace('$title', data.listName)
            .replace('$style', 'ls-contact-list-item')
            .replace('$firstLetter', '')
            .replace('$name', data.listName)
            .replace('$info', ownerLabel.getOwner(user));
          break;
        case 'user':
          template = template
            .replace('$title', data.mail)
            .replace('$style', '')
            .replace('$firstLetter', data.firstName.charAt(0))
            .replace('$name', data.firstName + ' ' + data.lastName)
            .replace('$info', data.mail);
          break;
        case 'threadmember':
          template = template
            .replace('$title', data.mail)
            .replace('$style', data.member === true ? ' firstLetterBgdGreen' : '')
            .replace('$firstLetter', data.firstName.charAt(0))
            .replace('$name', data.firstName + ' ' + data.lastName)
            .replace('$info', data.mail);
          break;
        default:
          template = data;
          break;
      }
      return template;
    }
  }
})();
