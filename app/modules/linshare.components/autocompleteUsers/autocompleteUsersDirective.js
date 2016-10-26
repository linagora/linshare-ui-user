/**
 * Created by Alpha O. Sall on 10/03/16.
 */
'use strict';

angular.module('linshare.components')
  .directive('lsAutocompleteUser', function(autocompleteUserRestService, $log, $q, componentsConfig) {
    return {
      restrict: 'A',
      scope: {
        selectedUsersList: '=',
        onSelectFunction: '='
      },
      templateUrl: componentsConfig.path + 'autocompleteUsers/autocompleteTemplate.html',
      controller: function($scope) {
        $scope.userRepresentation = function(u) {
          var template = '';
          switch (u.type) {
            case 'simple':
                  template = u.identifier;
                  break;
            case 'mailinglist':
                  template = u.listName.concat(' ', u.ownerLastName, ' ', u.ownerFirstName);
                  break;
            case 'user':
                  var firstLetter = u.firstName.charAt(0);
                  template = '' +
                    '<div  class="recipientsAutocomplete" title="' + u.domain + '">' +
                    '<span class="firstLetterFormat">' + firstLetter +'</span>' +
                    '<p class="recipientsInfo">' +
                    '<span class="user-full-name">'+ u.firstName + ' '+ u.lastName + '</span>' +
                    '<span class="email">' + u.mail + '</span>' +
                    '</p>' +
                    '</div>';
                  break;
            case 'threadmember':
                  var isMemberClass = u.member === true ? ' firstLetterBgdGreen': '';
                  template = '' +
                    '<div class="recipientsAutocomplete" title="' + u.domain + '">' +
                    '<span class="firstLetterFormat' + isMemberClass + '">' + u.firstName.charAt() + '</span>' +
                    '<p class="recipientsInfo">' +
                    '<span class="user-full-name">'+ u.firstName + ' '+ u.lastName + '</span>' +
                    '<span class="email">' + u.mail + '</span>' +
                    '</p>' +
                    '</div>';
                  break;
            default:
                  template = u;
                  break;
          }
          return template;
        };

        $scope.searchUsersAccount = function(pattern) {
          if (pattern.length >= 3) {
            var deferred = $q.defer();
            autocompleteUserRestService(pattern, $scope.completeType, $scope.completeThreadUuid).then(function(data) {
              if (data.length === 0) {
                $scope.userEmail = pattern;
              }
              deferred.resolve(data);
            });
            return deferred.promise;
          }
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
      link: function(scope, elm, attrs) {
        scope.completeType = attrs.lsAutocompleteUser;
        scope.completeThreadUuid = attrs.lsCompleteThreadUuid;
        elm.bind('keypress', function(event) {
          scope.completeThreadUuid = attrs.lsCompleteThreadUuid;
          if (event.keyCode === 13) {
            if (scope.noResult === true) {
              if (typeof scope.userEmail === 'string') {
                scope.selectedUser = {
                  mail: scope.userEmail,
                  firstName: null,
                  lastName: null,
                  domain: null,
                  type: 'user'
                };
              }
              scope.dealWithSelectedUser(scope.selectedUser, scope.selectedUsersList);
            }
          }
        });
      },
      replace: true
    };
  });
