/**
 * @author Alpha O. Sall
 */

'use strict';

angular.module('linshare.share')

  .factory('ShareObjectService', function(_, $log, functionalityRestService, LinshareShareService, $q, toastService,
    $translate, authenticationRestService, lsAppConfig, moment) {

    var recipients = [],
      mailingListUuid = [],
      mailingList = [],
      expirationDate = {},
      creationAcknowledgement = {},
      enableUSDA = {},
      notificationDateForUSDA = {},
      secured = {};

    /**
     * @name getFunctionalities
     * @desc Retireve functionality link to a share
     * @returns {Promise}
     * @memberOf linshare.share.ShareObjectService
     */
    function getFunctionalities() {
      return $q.all([functionalityRestService.getAll(), authenticationRestService.getCurrentUser()])
        .then(function(promises) {
        var functionalities = promises[0];

        angular.extend(notificationDateForUSDA, functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT__DURATION);
        notificationDateForUSDA.value = moment().add(notificationDateForUSDA.value, 'days').valueOf();
        angular.extend(enableUSDA, functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT);
        angular.extend(creationAcknowledgement,functionalities.SHARE_CREATION_ACKNOWLEDGEMENT_FOR_OWNER);
        angular.extend(expirationDate, functionalities.SHARE_EXPIRATION);
        expirationDate.value = moment().endOf('day').add(expirationDate.value, expirationDate.unit)
          .subtract(1, 'days').valueOf();

        angular.extend(secured, functionalities.ANONYMOUS_URL);
        if (promises[1].accountType === lsAppConfig.accountType.guest && promises[1].restricted) {
          secured.enable = false;
        }
      });
    }

    function ShareObjectForm(shareJson) {
      var self = this;
      getFunctionalities().then(function() {
        shareJson = shareJson || {};
        self.documents = shareJson.documents || [];
        self.recipients = shareJson.recipients || [];
        recipients = self.recipients;
        self.mailingListUuid = shareJson.mailingListUuid || [];
        self.mailingList = shareJson.mailingList || [];
        self.secured = shareJson.secured || secured;
        self.creationAcknowledgement = shareJson.creationAcknowledgement || creationAcknowledgement;
        self.expirationDate = shareJson.expirationDate || expirationDate;
        self.enableUSDA = shareJson.enableUSDA || enableUSDA;
        self.notificationDateForUSDA = shareJson.notificationDateForUSDA || notificationDateForUSDA;

        self.sharingNote = shareJson.sharingNote || '';
        self.subject = shareJson.subject || '';
        self.message = shareJson.message || '';

        self.asyncShare = shareJson.asyncShare || false;
        self.setAsyncShare = function(state) {
          self.asyncShare = state;
        };

        self.waitingUploadIdentifiers = shareJson.waitingUploadIdentifiers || [];
        self.uploadingDocuments = [];
        self.getMinDate = function() {
          return moment().endOf('day').valueOf();
        };
      });
    }

    //TODO: shouldn't exist same as app/modules/linshare.components/autocompleteUsers/autocompleteUsersController.js
    ShareObjectForm.prototype.addRecipient = function() {
      var contact = this.selectedUser;
      var exists = false;
      switch (contact.type) {
        case 'simple':
          angular.forEach(recipients, function (elem) {
            if (elem.mail === contact.identifier) {
              exists = true;
              $log.info('The user ' + contact.identifier + ' is already in the recipients list');
            }
          });
          if (!exists) {
            contact.mail = contact.identifier;
            recipients.push(_.omit(contact, 'restrictedContacts', 'type', 'display', 'identifier'));
          }
          break;
        case 'user':
          angular.forEach(recipients, function (elem) {
            if (elem.mail === contact.mail && elem.domain === contact.domain) {
              exists = true;
              $log.info('The user ' + contact.mail + ' is already in the recipients list');
            }
          });
          if (!exists) {
            recipients.push(_.omit(contact, 'restrictedContacts', 'type', 'display', 'identifier'));
          }
          break;
        case 'mailinglist':
          _.forEach(mailingListUuid, function(element) {
            if (element.identifier === contact.identifier) {
              exists = true;
              $log.info('The list ' + contact.listName + ' is already in the mailinglist');
            }
          });
          if (!exists) {
            mailingListUuid.push(contact.identifier);
            mailingList.push(_.omit(contact, 'display', 'identifier'));
          }
          break;
      }
    };

    ShareObjectForm.prototype.removeRecipient = function(index) {
      recipients.splice(index, 1);
    };

    ShareObjectForm.prototype.getRecipients = function() {
      return recipients;
    };

    ShareObjectForm.prototype.getMailingListUuid = function() {
      return mailingListUuid;
    };

    ShareObjectForm.prototype.getMailingList = function() {
      return mailingList;
    };

    ShareObjectForm.prototype.removeMailingList = function(index) {
      mailingListUuid.splice(index, 1);
      mailingList.splice(index, 1);
    };

    ShareObjectForm.prototype.addDocuments = function (documentList) {
      if (!angular.isArray(documentList)) {
        documentList = [documentList];
      }
      angular.forEach(documentList, function (doc) {
        this.documents.push(doc);
      }, this);
    };

    ShareObjectForm.prototype.getDocuments = function() {
      return this.documents;
    };

    ShareObjectForm.prototype.addwaitingUploadIdentifiers = function(identifier) {
      this.waitingUploadIdentifiers.push(identifier);
    };

    ShareObjectForm.prototype.getFormObj = function() {
      var docUuid = [];
      angular.forEach(this.documents, function(doc) {
        docUuid.push(doc.uuid);
      });
      return {
        recipients: recipients,
        documents: docUuid,
        mailingListUuid: mailingListUuid,
        secured: secured.value,
        creationAcknowledgement: creationAcknowledgement.value,
        expirationDate: expirationDate.value,
        enableUSDA: enableUSDA.value,
        notificationDateForUSDA: notificationDateForUSDA.value,
        sharingNote: this.sharingNote,
        subject: this.subject,
        message: this.message
      };
    };

    ShareObjectForm.prototype.getObjectCopy = function() {
      return {
        recipients: recipients,
        documents: this.documents,
        mailingListUuid: mailingListUuid,
        secured: secured.value,
        creationAcknowledgement: creationAcknowledgement.value,
        expirationDate: expirationDate.value,
        enableUSDA: enableUSDA.value,
        notificationDateForUSDA: notificationDateForUSDA.value,
        sharingNote: this.sharingNote,
        subject: this.subject,
        message: this.message,
        waitingUploadIdentifiers: this.waitingUploadIdentifiers
      };
    };

    ShareObjectForm.prototype.share = function() {
      var deferred = $q.defer();
      if (this.waitingUploadIdentifiers.length === 0) {
        if(this.documents.indexOf(undefined) === -1) {
          return LinshareShareService.create(this.getFormObj()).then(function() {
            $translate('GROWL_ALERT.ACTION.SHARE').then(function(message) {
              toastService.success(message);
            });
          });
        } else {
          $log.debug('SHARE FAILED -', 'file(s) upload error');
          $translate('GROWL_ALERT.ACTION.SHARE_FAILED').then(function(message) {
            toastService.error(message);
          });
          deferred.reject({statusText: 'file(s) upload error'});
        }
      } else {
        deferred.reject({statusText: 'asyncMode'});
      }
      return deferred.promise;
    };

    //on file upload complete check if id is in the waiting share
    ShareObjectForm.prototype.addLinshareDocumentsAndShare = function(flowIdentifier, linshareDocument) {
      var ind = this.waitingUploadIdentifiers.indexOf(flowIdentifier);
      var documents = this.documents;
      if (ind > -1) {
        _.forEach(documents, function(doc, index) {
          if (!_.isUndefined(doc)) {
            if (doc.uniqueIdentifier === flowIdentifier) {
              documents[index] = linshareDocument;
            }
          }
        }, this);
        this.waitingUploadIdentifiers.splice(ind, 1);
      }
      this.share();
    };

    ShareObjectForm.prototype.resetForm = function() {
      recipients = [];
      this.recipients = [];
      mailingListUuid = [];
      mailingList = [];
      this.mailingList = [];
      mailingListUuid = [];
      this.mailingListUuid = [];
      this.documents = [];
      this.secured = secured;
      this.creationAcknowledgement = creationAcknowledgement;

      this.expirationDate = expirationDate;
      this.enableUSDA = enableUSDA;
      this.notificationDateForUSDA = notificationDateForUSDA;

      this.sharingNote = '';
      this.subject = '';
      this.message = '';

      this.asyncShare = false;
      this.setAsyncShare = function(state) {
        this.asyncShare = state;
      };
      this.waitingUploadIdentifiers = [];
    };

    ShareObjectForm.prototype.getUploadingDocuments = function() {
      return this.uploadingDocuments;
    };

    ShareObjectForm.prototype.addUploadingDocuments = function() {

    };

    ShareObjectForm.prototype.isValid = function() {
      return this.documents.length > 0 && (recipients.length || mailingListUuid.length > 0);
    };

    ShareObjectForm.prototype.isShared = function() {
      return this.waitingUploadIdentifiers.length === 0;
    };

    return ShareObjectForm;

  });
