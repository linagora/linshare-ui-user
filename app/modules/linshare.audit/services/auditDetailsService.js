/**
 * auditDetailsService factory
 * @namespace LinShare.audit
 */
(function() {
  'use strict';

  angular
    .module('linshare.audit')
    .factory('auditDetailsService', auditDetailsService);

  auditDetailsService.$inject = ['$filter', '$q', 'lsAppConfig'];

  /**
   * @namespace auditDetailsService
   * @desc Service to interact with Audit actions to generate all details
   * @memberOf LinShare.audit
   */
  function auditDetailsService($filter, $q, lsAppConfig) {
    const
      ACTIONS_KEY = {
        ADDITION: 'ADDITION',
        COPY: 'COPY',
        CREATE: 'CREATE',
        CREATE_SHARE: 'CREATE_SHARE',
        DELETE: 'DELETE',
        DOWNLOAD: 'DOWNLOAD',
        FAILURE: 'FAILURE',
        READ: 'READ',
        RECEIVE_SHARE: 'RECEIVE_SHARE',
        SUCCESS: 'SUCCESS',
        UPDATE: 'UPDATE',
        UPLOAD: 'UPLOAD',
        VIEWED: 'VIEWED'
      },
      CONTAINERS_CHILDREN = ['CONTACTS_LISTS_CONTACTS', 'GUEST', 'WORKGROUP_DOCUMENT', 'WORKGROUP_FOLDER', 'WORKGROUP_MEMBER'],
      SENTENCES_KEYS_PREFIX = 'DETAILS_POPUP.SENTENCES',
      TYPE_ICONS = {
        'ANONYMOUS_SHARE_ENTRY': 'zmdi zmdi-share',
        'AUTHENTICATION': 'zmdi zmdi-account',
        'CONTACTS_LISTS': 'zmdi zmdi-account-box-phone',
        'CONTACTS_LISTS_CONTACTS': 'zmdi zmdi-account-box-phone',
        'DOCUMENT_ENTRY': 'zmdi zmdi-file',
        'GUEST': 'zmdi zmdi-account-box',
        'SHARE_ENTRY': 'zmdi zmdi-share',
        'WORKGROUP': 'zmdi zmdi-accounts-alt',
        'WORKGROUP_DOCUMENT': 'zmdi zmdi-accounts-alt',
        'WORKGROUP_FOLDER': 'zmdi zmdi-accounts-alt',
        'WORKGROUP_MEMBER': 'zmdi zmdi-accounts-alt'
      },
      TYPES_KEY = {
        ANONYMOUS_SHARE_ENTRY: 'ANONYMOUS_SHARE_ENTRY',
        AUTHENTICATION: 'AUTHENTICATION',
        CONTACTS_LISTS: 'CONTACTS_LISTS',
        CONTACTS_LISTS_CONTACTS: 'CONTACTS_LISTS_CONTACTS',
        DOCUMENT_ENTRY: 'DOCUMENT_ENTRY',
        GUEST: 'GUEST',
        SHARE_ENTRY: 'SHARE_ENTRY',
        WORKGROUP: 'WORKGROUP',
        WORKGROUP_DOCUMENT: 'WORKGROUP_DOCUMENT',
        WORKGROUP_FOLDER: 'WORKGROUP_FOLDER',
        WORKGROUP_MEMBER: 'WORKGROUP_MEMBER'
      },
      UPDATE_FIELDS_KEY = {
        'expirationDate': 'EXPIRATION_DATE',
        'name': 'NAME',
        'identifier': 'NAME',
        'firstName': 'FIRST_NAME',
        'lastName': 'LAST_NAME',
        'mail': 'NAME',
        'right': 'RIGHT'
      },
      UPDATE_FIELDS_KEYS_PREFIX = 'DETAILS_POPUP.UPDATED_FIELDS.',
      UPDATE_FIELDS_RIGHTS_KEYS_PREFIX = 'DETAILS_POPUP.UPDATED_FIELDS_RIGHTS.',
      UPDATE_FIELDS_TO_CHECK = ['expirationDate', 'firstName', 'identifier', 'lastName', 'mail', 'name'];

    var
      author_me,
      author_system,
      service = {
        generateAllDetails: generateAllDetails
      };

    return service;

    ////////////

    /**
     * @name generateAllDetails
     * @desc Generate all details of each audit action
     * @param {string} loggedUserUuid - Uuid of logged user
     * @param {Object} auditDetails - All audit actions
     * @memberOf LinShare.audit.auditDetailsService
     */
    function generateAllDetails(loggedUserUuid, auditDetails) {
      return $q(function(resolve) {
        author_me = $filter('translate')('AUTHOR_ME');
        author_system = $filter('translate')('AUTHOR_SYSTEM');
        _.forEach(auditDetails, function(auditAction) {
          if (auditAction.resource) {
            generateDetails(loggedUserUuid, auditAction);
          } else {
            auditAction.resource = auditAction.actor;
            generateDetails(loggedUserUuid, auditAction);
          }
        });
        resolve(auditDetails);
      });
    }

    /**
     * @name generateDetails
     * @desc Generate all details of one audit action
     * @param {string} loggedUserUuid - Uuid of logged user
     * @param {Object} auditAction - One audit action
     * @memberOf LinShare.audit.auditDetailsService
     */
    function generateDetails(loggedUserUuid, auditAction) {
      auditAction.isAuthor = setIsAuthor(auditAction, loggedUserUuid);
      auditAction.authorName = setAuthorName(auditAction);
      auditAction.authorReference = setAuthorReference(auditAction);
      auditAction.dateShortVarious = setDateVarious(auditAction, 'shortTime');
      auditAction.dateCalendarVarious = setDateVarious(auditAction, 'calendarTime');
      auditAction.resourceName = setResourceName(auditAction, loggedUserUuid);
      auditAction.resourceNameVarious = setResourceNameVarious(auditAction);
      auditAction.userVarious = setUserVarious(auditAction, loggedUserUuid);
      auditAction.shareRecipient = setShareRecipient(auditAction, loggedUserUuid);
      auditAction.icon = setTypeIcon(auditAction.type);
      auditAction.hasBracket = setHasBracket(auditAction.type);
      auditAction.sentenceKey = setSentenceKey(auditAction, '.SENTENCE');
      auditAction.sentenceAction = setSentenceKey(auditAction, '.ACTION');
      auditAction.sentenceVars = setSentenceVars(auditAction);
      auditAction.updatedValues = setUpdatedValues(auditAction);
      auditAction.translatedAction = setTranslatedVar(auditAction.action, 'ACTION.');
      auditAction.translatedType = setTranslatedVar(auditAction.type, 'TYPE.');
    }

    /**
     * @name setAuthorReference
     * @desc Set audit action's author reference
     * @param {Object} auditAction - One audit action
     * @returns {string} Author reference
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setAuthorReference(auditAction) {
      return auditAction.isAuthor ? 'AUTHOR' : 'VIEWER';
    }

    /**
     * @name setAuthorName
     * @desc Set audit action's author reference ('me' for me and other's full name)
     * @param {Object} auditAction - One audit action
     * @returns {string} Author name
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setAuthorName(auditAction) {
      return auditAction.isAuthor ? author_me : setFullName(auditAction.actor);
    }

    /**
     * @name setDateVarious
     * @desc Set a formatted date
     * @param {Object} auditAction - One audit action
     * @param {string} timeType - Name of the filter date to apply
     * @returns {string} Formatted date
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setDateVarious(auditAction, timeType) {
      return $filter(timeType)(auditAction.creationDate);
    }

    /**
     * @name setFullName
     * @desc Concatenate firstName and lastName
     * @param {Object} user - user datas to concatenate
     * @returns {string} Concatenated full name
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setFullName(user) {
      var fullName;
      if(user.role === 'SUPERADMIN') {
        fullName = author_system;
      } else if (user.name) {
        fullName = user.name;
      } else {
        fullName = (user.firstName || user.lastName) ? user.firstName + ' ' + user.lastName : user.mail;
      }
      return fullName;
    }

    /**
     * @name setHasBracket
     * @desc Check if action's type is a container or not, to add a bracket
     * @param {string} resourceType - resource type's name
     * @returns {boolean} Has bracket
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setHasBracket(resourceType) {
      return (CONTAINERS_CHILDREN.indexOf(resourceType) !== -1);
    }

    /**
     * @name setIsAuthor
     * @desc Set boolean if author is logged user
     * @param {Object} auditAction - One audit action
     * @param {string} loggedUserUuid - Uuid of logged user
     * @returns {boolean} Is author
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setIsAuthor(auditAction, loggedUserUuid) {
      return (auditAction.actor.uuid === loggedUserUuid);
    }

    /**
     * @name setResourceName
     * @desc Find in all the object the name of the resource
     * @param {Object} auditAction - One audit action
     * @param {string} loggedUserUuid - Uuid of logged user
     * @returns {string} Resource name
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setResourceName(auditAction, loggedUserUuid) {
      var resourceName;
      if (auditAction.resource.user) {
        resourceName = (auditAction.resource.user.uuid === loggedUserUuid) ? author_me :
          setFullName(auditAction.resource.user);
      } else if (auditAction.resource.firstName) {
        resourceName = (auditAction.resource.uuid === loggedUserUuid) ? author_me : setFullName(auditAction.resource);
      } else {
        resourceName = auditAction.resource.name;
      }
      return resourceName;
    }

    /**
     * @name setResourceNameVarious
     * @desc Set second resource name (only used for folders of workgroups for the moment)
     * @param {Object} auditAction - One audit action
     * @returns {string} Resource name various
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setResourceNameVarious(auditAction) {
      var resourceNameVarious;
      if (auditAction.workGroup) {
        resourceNameVarious = auditAction.workGroup.name;
      } else if (auditAction.list) {
        resourceNameVarious = auditAction.list.name;
      }
      return resourceNameVarious;
    }

    /**
     * @name setSentenceKey
     * @desc Set sentence key
     * @param {Object} auditAction - One audit action
     * @param {string} key - End key of all the chain to get the related translation value
     * @returns {string} Concatenated word to create the chain to get related translation
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setSentenceKey(auditAction, key) {
      return SENTENCES_KEYS_PREFIX + '.' +
        auditAction.type + '.' +
        auditAction.action + '.' +
        auditAction.authorReference +
        key;
    }

    /**
     * @name setShareRecipient
     * @desc Set share recipient
     * @param {Object} auditAction - One audit action
     * @param {string} loggedUserUuid - Uuid of logged user
     * @returns {string} Recipient
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setShareRecipient(auditAction, loggedUserUuid) {
      var shareRecipient;
      // TODO : no need first check when recipient will be added for ANONYMOUS-CREATE audit
      if(auditAction.type === TYPES_KEY.ANONYMOUS_SHARE_ENTRY || auditAction.type === TYPES_KEY.SHARE_ENTRY) {
        if(!auditAction.resource.recipient) {
          shareRecipient = auditAction.recipientMail;
        } else {
          shareRecipient = (auditAction.resource.recipient.uuid === loggedUserUuid) ? author_me : setFullName(auditAction.resource.recipient);
        }
      }
      return shareRecipient;
    }

    /**
     * @name setSentenceVars
     * @desc Set sentence variables
     * @param {Object} auditAction - One audit action
     * @returns {string} Variables to replace in sentence
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setSentenceVars(auditAction) {
      return {
        authorName: '<b>' + auditAction.authorName + '</b>',
        dateVarious: '<b title="' + auditAction.dateCalendarVarious + '">' + auditAction.dateShortVarious + '</b>', // TODO : add uib tooltip
        userVarious: '<span class="activity-user-target">' + auditAction.userVarious + '</span>',
        resourceName: '<span class="activity-resource-name">' + auditAction.resourceName + '</span>',
        resourceNameVarious: '<span class="activity-resource-name">' + auditAction.resourceNameVarious + '</span>',
        updatedValues: '<b>' + auditAction.updatedValues + '</b>'
      };
    }

    /**
     * @name setTypeIcon
     * @desc Set audit action type's icon
     * @param {string} resourceType - Resource type's name
     * @returns {string} Author reference
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setTypeIcon(resourceType) {
      return TYPE_ICONS[resourceType];
    }

    /**
     * @name setTypeIcon
     * @desc Translate string
     * @param {string} originalString - String to translate
     * @param {string} key - Key to concat to find related translation
     * @returns {string} Icon css classes
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setTranslatedVar(originalString, key) {
      return $filter('translate')('FILTERS_SELECT.' + key + originalString);
    }

    /**
     * @name setUpdatedValues
     * @desc Set updated values (e.q. oldValue -> newValue)
     * @param {Object} auditAction - One audit action
     * @returns {Object} Updated values
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setUpdatedValues(auditAction) {
      var updatedValues = {};
      if (auditAction.action === ACTIONS_KEY.UPDATE) {
        setUpdatedValuesDeepFind(auditAction.resource, auditAction.resourceUpdated, updatedValues);
        if (updatedValues.firstName || updatedValues.lastName) {
          delete updatedValues.name;
        }
        setUpdatedValuesGuestExpirationDate(auditAction, updatedValues);
        setUpdatedValuesWorkgroupMember(auditAction, updatedValues);
      }
      return updatedValues;
    }

    /**
     * @name setUpdatedValuesDeepFind
     * @desc Browse all the object and objects in object (and so on...) and compare values to pick updated ones
     * @param {Object} oldValues - Old values's object
     * @param {Object} newValues - Updated values's object
     * @param {Object} updatedValues - Object to fill with updated values
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setUpdatedValuesDeepFind(oldValues, newValues, updatedValues) {
      _.forEach(newValues, function(value, key) {
        if (typeof value === 'object' || Object.prototype.toString.call(value) === '[object Array]') {
          setUpdatedValuesDeepFind(value, newValues[key]);
        } else {
          if (oldValues[key] !== newValues[key] && UPDATE_FIELDS_TO_CHECK.indexOf(key) !== -1) {
            updatedValues[key] = {
              keyName: UPDATE_FIELDS_KEYS_PREFIX + UPDATE_FIELDS_KEY[key],
              oldValue: oldValues[key],
              newValue: newValues[key]
            };
          }
        }
      });
    }

    /**
     * @name setUpdatedValuesGuestExpirationDate
     * @desc Set workgroup member updates's audit values
     * @param {Object} auditAction - One audit action
     * @param {Object} updatedValues - Object to fill with updated values
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setUpdatedValuesGuestExpirationDate(auditAction, updatedValues) {
      if (auditAction.type === TYPES_KEY.GUEST) {
        var oldDate = auditAction.resource.expirationDate;
        var newDate = auditAction.resourceUpdated.expirationDate;
        if (oldDate !== newDate) {
          updatedValues.expirationDate = {
            keyName: UPDATE_FIELDS_KEYS_PREFIX + UPDATE_FIELDS_KEY.expirationDate,
            oldValue: $filter('shortTime')(oldDate),
            newValue: $filter('shortTime')(newDate),
            oldValueFull: $filter('calendarTime')(oldDate),
            newValueFull: $filter('calendarTime')(newDate)
          };
        }
      }
    }

    /**
     * @name setUpdatedValuesWorkgroupMember
     * @desc Set workgroup member updates's audit values
     * @param {Object} auditAction - One audit action
     * @param {Object} updatedValues - Object to fill with updated values
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setUpdatedValuesWorkgroupMember(auditAction, updatedValues) {
      if (auditAction.type === TYPES_KEY.WORKGROUP_MEMBER) {
        var oldRights = setUpdatedValuesWorkgroupMemberRights(auditAction.resource);
        var newRights = setUpdatedValuesWorkgroupMemberRights(auditAction.resourceUpdated);
        if (oldRights !== newRights) {
          updatedValues.right = {
            keyName: UPDATE_FIELDS_KEYS_PREFIX + UPDATE_FIELDS_KEY.right,
            oldValue: UPDATE_FIELDS_RIGHTS_KEYS_PREFIX + oldRights,
            newValue: UPDATE_FIELDS_RIGHTS_KEYS_PREFIX + newRights,
            rightsUpdate: true
          };
        }
      }
    }

    /**
     * @name setUpdatedValuesWorkgroupMemberRights
     * @desc Calculate workgroup member's rights
     * @param {Object} memberRights - One audit action's resource or resourceUpdated object
     * @returns {string} Calculated rights of the member
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setUpdatedValuesWorkgroupMemberRights(memberRights) {
      var role;
      if (memberRights.admin) {
        role = lsAppConfig.roles.admin;
      } else if (!memberRights.admin && memberRights.canUpload) {
        role = lsAppConfig.roles.write;
      } else {
        role = lsAppConfig.roles.readonly;
      }
      return role;
    }

    /**
     * @name setUserVarious
     * @desc Set other user's full name
     * @param {Object} auditAction - One audit action
     * @param {string} loggedUserUuid - Uuid of logged user
     * @returns {string} User various
     * @memberOf LinShare.audit.auditDetailsService
     */
    function setUserVarious(auditAction, loggedUserUuid) {
      var userVarious;
      if (auditAction.resource.firstName) {
        userVarious = (auditAction.resource.uuid === loggedUserUuid) ? author_me : setFullName(auditAction.resource);
      } else if (auditAction.resource.sender && (auditAction.resource.sender.uuid !== auditAction.owner.uuid)) {
        userVarious = (auditAction.resource.sender.uuid === loggedUserUuid) ? author_me : setFullName(auditAction.resource.sender);
      } else if (auditAction.resource.recipient) {
        userVarious = (auditAction.resource.recipient.uuid === loggedUserUuid) ? author_me : setFullName(auditAction.resource.recipient);
      } else if (auditAction.recipientMail) {
        userVarious = auditAction.recipientMail;
      }
      return userVarious;
    }
  }
})();
