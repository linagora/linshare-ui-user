/**
 * @author Alpha O. Sall
 */

'use strict';

angular.module('linshare.share')

  .factory('ShareObjectService', function($log, functionalityRestService, LinshareShareService, $q, growlService) {

    var recipients = [],
      mailingListUuid = [],
      expirationDate = {},
      creationAcknowledgement = {},
      enableUSDA = {},
      notificationDateForUSDA = {},
      secured = {};

    functionalityRestService.getFunctionalityParams('SHARE_EXPIRATION').then(function(expiration) {
      angular.extend(expirationDate, expiration);
      expirationDate.value = moment().endOf('day').add(expirationDate.value, expirationDate.unit).subtract(1, 'd').valueOf();
    });

    functionalityRestService.getFunctionalityParams('SHARE_CREATION_ACKNOWLEDGEMENT_FOR_OWNER').then(function(param) {
      angular.extend(creationAcknowledgement, param);
    });
    functionalityRestService.getFunctionalityParams('UNDOWNLOADED_SHARED_DOCUMENTS_ALERT').then(function(param) {
      angular.extend(enableUSDA, param);
    });

    functionalityRestService.getFunctionalityParams('UNDOWNLOADED_SHARED_DOCUMENTS_ALERT__DURATION').then(function(param) {
      angular.extend(notificationDateForUSDA, param);
      notificationDateForUSDA.value = moment().add(notificationDateForUSDA.value, 'days').valueOf();
    });

    functionalityRestService.getFunctionalityParams('ANONYMOUS_URL').then(function(param) {
      angular.extend(secured, param);
    });

    function ShareObjectForm(shareJson) {
      shareJson = shareJson || {};
      this.documents = shareJson.documents || [];
      this.recipients = shareJson.recipients || [];
      recipients = this.recipients;
      this.mailingListUuid = shareJson.mailingListUuid || [];
      this.secured = shareJson.secured || secured;
      this.creationAcknowledgement = shareJson.creationAcknowledgement || creationAcknowledgement;
      this.expirationDate = shareJson.expirationDate || expirationDate;
      this.enableUSDA = shareJson.enableUSDA || enableUSDA;
      this.notificationDateForUSDA = shareJson.notificationDateForUSDA || notificationDateForUSDA;

      this.sharingNote = shareJson.sharingNote || '';
      this.subject = shareJson.subject || '';
      this.message = shareJson.message || '';

      this.asyncShare = shareJson.asyncShare || false;
      this.setAsyncShare = function(state) {
        this.asyncShare = state;
      };

      this.waitingUploadIdentifiers = shareJson.waitingUploadIdentifiers || [];
      this.uploadingDocuments = [];

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
          angular.forEach(mailingListUuid, function(element) {
            if (element.identifier === contact.identifier) {
              exists = true;
              $log.info('The list ' + contact.listName + ' is already in the mailinglist');
            }
          });
          if (!exists) {
            mailingListUuid.push(contact.identifier);
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

    ShareObjectForm.prototype.removeMailingList = function(index) {
      mailingListUuid.splice(index, 1);
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
        return LinshareShareService.create(this.getFormObj()).then(function() {
          growlService.notifyTopRight('GROWL_ALERT.ACTION.SHARE', 'inverse');
        });
      } else {
        deferred.reject({statusText: 'asyncMode'});
        return deferred.promise;
      }
    };

    //on file upload complete check if id is in the waiting share
    ShareObjectForm.prototype.addLinshareDocumentsAndShare = function(flowIdentifier, linshareDocument) {
      var ind = this.waitingUploadIdentifiers.indexOf(flowIdentifier);
      if (ind > -1) {
        angular.forEach(this.documents, function(doc, index) {
          if (doc.uniqueIdentifier === flowIdentifier) {
            this.documents[index] = linshareDocument;
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
