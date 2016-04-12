/**
 * Created by Alpha O. Sall on 10/03/16.
 */
'use strict';

angular.module('linshare.components')
  .directive('autocompleteUser', function(LinshareShareService, $log) {
    return {
      restrict: 'A',
      scope: {
        selectedUsersList: '=',
        onSelectFunction: '='
      },
      template: '<div class="chat-search">' +
      '<div class="fg-line">' +
      '<input id="focusInputShare" type="text" class="form-control"' +
      'placeholder="{{ \'COMPONENTS.AUTOCOMPLETE_USERS.INPUT_PLACEHOLDER \' | translate}}" autocomplete="off"' +
      'x-ng-model="selectedUser" required' +
      'x-typeahead-min-length="3" ' +
      'x-typeahead-on-select="dealWithSelectedUser(selectedUser, selectedUsersList)" ' +
      'x-typeahead-wait-ms="30" ' +
      'x-typeahead-loading="searchingContact" ' +
      'x-typeahead-input-formatter="angular.noop" ' +
      'x-typeahead="u as userRepresentation(u) for u in searchUsersAccount($viewValue) | limitTo:3">' +
      '</div>' +
      '</div>',
      controller: function($scope) {
        $scope.userRepresentation = function(u) {
          if (angular.isString(u)) {
            return u;
          }
          if(u.type === 'ListAutoCompleteResultDto') {
            return u.listName.concat(' ', u.ownerLastName, ' ', u.ownerFirstName);
          }
          return u.firstName.concat(' ', u.lastName, ' ', u.mail, ' ', u.domain);
        };

        $scope.searchUsersAccount = function(pattern) {
          return LinshareShareService.autocomplete(pattern);
        };

        var addRecipients = function(selectedUser, selectedUsersList) {
          var exists = false;
          angular.forEach(selectedUsersList, function(elem) {
            if (elem.mail === selectedUser.mail && elem.domain === selectedUser.domain) {
              exists = true;
              $log.info('The contact ' + selectedUser.mail + ' has already been added to that guest\'s restricted contacts');
            }
          });
          if (!exists) {
            selectedUsersList.push(_.omit(selectedUser, 'restrictedContacts', 'uuid', 'type', 'identifier', 'display'));
          }
        };

        $scope.dealWithSelectedUser = $scope.onSelectFunction || addRecipients;
      },
      replace: true
    }
  });
