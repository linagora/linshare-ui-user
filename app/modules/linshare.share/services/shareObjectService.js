/**
 * @author Alpha O. Sall
 */

'use strict';

angular.module('linshare.share')

  .factory('ShareObjectService', function(_, $log, functionalityRestService, LinshareShareService, $q, toastService, authenticationRestService, lsAppConfig, moment) {

    var recipients = [],
      mailingListUuid = [],
      mailingList = [],
      expirationDate = {},
      creationAcknowledgement = {},
      enableUSDA = {},
      notificationDateForUSDA = {},
      secured = {},
      forceAnonymousSharing = {};

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
          notificationDateForUSDA.maxValue = notificationDateForUSDA.maxValue ? moment().add(notificationDateForUSDA.maxValue, 'days').valueOf() : undefined;
          angular.extend(enableUSDA, functionalities.UNDOWNLOADED_SHARED_DOCUMENTS_ALERT);
          angular.extend(creationAcknowledgement,functionalities.SHARE_CREATION_ACKNOWLEDGEMENT_FOR_OWNER);
          angular.extend(expirationDate, functionalities.SHARE_EXPIRATION);
          angular.extend(secured, functionalities.ANONYMOUS_URL);
          if (promises[1].accountType === lsAppConfig.accountType.guest && promises[1].restricted) {
            secured.enable = false;
          }

          forceAnonymousSharing = Object.assign(
            {},
            functionalities.ANONYMOUS_URL__FORCE_ANONYMOUS_SHARING
          );
        });
    }

    function ShareObjectForm(shareJson) {
      var self = this;

      shareJson = _.defaultTo(shareJson, {});
      self.name = _.defaultTo(shareJson.name, '');
      self.documents = _.defaultTo(shareJson.documents, []);
      self.recipients = _.defaultTo(shareJson.recipients, []);
      recipients = self.recipients;
      self.mailingListUuid = _.defaultTo(shareJson.mailingListUuid, []);
      mailingListUuid = self.mailingListUuid;
      self.mailingList = _.defaultTo(shareJson.mailingList, []);
      mailingList = self.mailingList;
      self.sharingNote = _.defaultTo(shareJson.sharingNote, '');
      self.subject = _.defaultTo(shareJson.subject, '');
      self.message = _.defaultTo(shareJson.message, '');

      self.asyncShare = _.defaultTo(shareJson.asyncShare, false);
      self.setAsyncShare = function(state) {
        self.asyncShare = state;
      };

      self.waitingUploadIdentifiers = _.defaultTo(shareJson.waitingUploadIdentifiers, []);
      self.uploadingDocuments = [];
      self.getMinDate = () => moment().endOf('day').valueOf();
      self.getMaxDate = () => moment().endOf('day').add(expirationDate.maxValue, expirationDate.maxUnit).subtract(1, 'days').valueOf();
      self.getDefaultDate = () => moment().endOf('day').add(expirationDate.value, expirationDate.unit).subtract(1, 'days').valueOf();
      self.getMaxUSDADate = () => {
        let maxDate;

        if (notificationDateForUSDA.maxValue) {
          maxDate = notificationDateForUSDA.maxValue;
        }
        if (self.expirationDate && self.expirationDate.value) {
          if (!maxDate || moment(maxDate).valueOf() > moment(self.expirationDate.value).valueOf()) {
            maxDate = self.expirationDate.value;
          }
        }

        return maxDate;
      };
      self.checkValidNotificationDateForUSDA = () => {
        if (self.notificationDateForUSDA && self.notificationDateForUSDA.value) {
          const notiDateForUSDAValue = moment(self.notificationDateForUSDA.value).valueOf();

          if (notiDateForUSDAValue < self.getMinDate()) {
            return false;
          }

          if (self.getMaxUSDADate() && notiDateForUSDAValue > self.getMaxUSDADate()) {
            return false;
          }
        }

        return true;
      };

      getFunctionalities().then(function() {
        self.secured = _.defaultTo(shareJson.secured, secured);
        self.creationAcknowledgement = _.defaultTo(shareJson.creationAcknowledgement, creationAcknowledgement);
        self.expirationDate =_.defaultTo(shareJson.expirationDate, _.assign({}, expirationDate, { value: self.getDefaultDate() }));
        self.enableUSDA = _.defaultTo(shareJson.enableUSDA, enableUSDA);
        self.notificationDateForUSDA =  _.defaultTo(shareJson.notificationDateForUSDA, notificationDateForUSDA);
        self.forceAnonymousSharing = _.defaultTo(
          shareJson.forceAnonymousSharing,
          forceAnonymousSharing
        );
      }).catch(function(error) {
        $log.debug('Error when creating ShareObjectForm', error);
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

      _.forEach(this.documents, function(doc) {
        docUuid.push(doc.uuid);
      });

      return {
        recipients: recipients,
        documents: docUuid,
        mailingListUuid: mailingListUuid,
        mailingList: mailingList,
        secured: secured.value,
        creationAcknowledgement: creationAcknowledgement.value,
        expirationDate: this.expirationDate.value,
        enableUSDA: enableUSDA.value,
        notificationDateForUSDA: notificationDateForUSDA.value,
        sharingNote: this.sharingNote,
        subject: this.subject,
        message: this.message,
        forceAnonymousSharing: forceAnonymousSharing.value
      };
    };

    ShareObjectForm.prototype.getObjectCopy = function() {
      return {
        recipients: recipients,
        documents: this.documents,
        mailingListUuid: mailingListUuid,
        mailingList: mailingList,
        secured: secured.value,
        creationAcknowledgement: creationAcknowledgement.value,
        expirationDate: this.expirationDate.value,
        enableUSDA: enableUSDA.value,
        notificationDateForUSDA: notificationDateForUSDA.value,
        sharingNote: this.sharingNote,
        subject: this.subject,
        message: this.message,
        waitingUploadIdentifiers: this.waitingUploadIdentifiers,
        forceAnonymousSharing: forceAnonymousSharing.value
      };
    };

    ShareObjectForm.prototype.share = function(toast = true) {
      const self = this;
      const deferred = $q.defer();

      if (this.waitingUploadIdentifiers.length === 0) {
        if(this.documents.indexOf(undefined) === -1) {
          return LinshareShareService.create(_.omit(this.getFormObj(), 'mailingList')).then(function() {
            if (toast) {
              toastService.success({
                key: 'TOAST_ALERT.ACTION.SHARE',
                params: {
                  shareName: self.name,
                  singular: self.documents.length<2
                }
              });
            }
          });
        } else {
          $log.debug('SHARE FAILED -', 'file(s) upload error');
          if (toast) {
            toastService.error({
              key: 'TOAST_ALERT.ACTION.SHARE_FAILED',
              params: {
                shareName: self.name
              }
            });
          }
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
      mailingList = [];
      this.mailingList = [];
      mailingListUuid = [];
      this.mailingListUuid = [];
      this.documents = [];
      this.secured = secured;
      this.creationAcknowledgement = creationAcknowledgement;

      this.expirationDate = _.assign({}, expirationDate, { value: this.getDefaultDate() });
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
      this.forceAnonymousSharing = forceAnonymousSharing;
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
