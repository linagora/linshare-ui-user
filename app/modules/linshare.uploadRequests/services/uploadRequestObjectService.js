/**
 * UploadRequestObjectService Factory
 * @namespace LinShare.uploadRequests
 */
(function() {
  'use strict';

  angular
    .module('linshare.uploadRequests')
    .factory('UploadRequestObjectService', UploadRequestObjectService);

  UploadRequestObjectService.$inject = [
    '_', '$q', 'functionalityRestService', 'uploadRequestRestService', 'moment', '$log'
  ];

  /**
   *  @namespace UploadRequestObjectService
   *  @desc Manipulation of uploadRequest object front/back
   *  @memberOf LinShare.uploadRequest
   */
  function UploadRequestObjectService(_, $q, functionalityRestService, uploadRequestRestService, moment, $log) {

    var
      allowedToActivation = {},
      allowedToExpiration = {},
      allowedToExpiryNotification = {},
      allowedToTotalSizeOfFiles = {},
      allowedToMaxSizeOfAFile = {},
      allowedToMaxNumberOfFiles = {},
      allowedToPasswordProtected = {},
      allowedToDeletion = {},
      allowedToClosure = {},
      allowedToNotificationLanguage = {},
      form = {
        expirationDate: null,
        totalSizeOfFiles: {
          value: 0,
          unit: 'KB'
        },
        maxNumberOfFiles: 0,
        maxSizeOfAFile: {
          value: 0,
          unit: 'KB'
        },
        activationDate: null,
        passwordProtected: false,
        allowDeletion: false,
        allowClosure: false,
        notificationDate: null,
        notificationLanguage: 'us'
      },
      self;

    return UploadRequestObject;

    ////////////

    /**
     *  @name UploadRequestObject
     *  @desc Constructor of the uploadRequest object
     *  @param {Object} jsonObject - Json object for constructing a uploadRequest object
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function UploadRequestObject(jsonObject) {
      self = this;
      jsonObject = jsonObject || {};
      checkFunctionalities().then(function() {
        self.allowedToActivation = _.cloneDeep(allowedToActivation);
        self.allowedToExpiration = _.cloneDeep(allowedToExpiration);
        self.allowedToExpiryNotification = _.cloneDeep(allowedToExpiryNotification);
        self.allowedToTotalSizeOfFiles = _.cloneDeep(allowedToTotalSizeOfFiles);
        self.allowedToMaxSizeOfAFile = _.cloneDeep(allowedToMaxSizeOfAFile);
        self.allowedToMaxNumberOfFiles = _.cloneDeep(allowedToMaxNumberOfFiles);
        self.allowedToPasswordProtected = _.cloneDeep(allowedToPasswordProtected);
        self.allowedToDeletion = _.cloneDeep(allowedToDeletion);
        self.allowedToClosure = _.cloneDeep(allowedToClosure);
        self.allowedToNotificationLanguage = _.cloneDeep(allowedToNotificationLanguage);
        self.create = create;
        self.creationDate = setPropertyValue(jsonObject.creationDate, '');
        self.domain = setPropertyValue(jsonObject.domain, '');
        self.activationDate = setPropertyValue(jsonObject.activationDate, allowedToActivation.value);
        self.expirationDate = setPropertyValue(jsonObject.expirationDate, allowedToExpiration.value);
        self.notificationDate = setPropertyValue(jsonObject.notificationDate, allowedToExpiryNotification.value);
        self.maxSizeOfAFile = {
          value: setPropertyValue(jsonObject.maxSizeOfAFile && jsonObject.maxSizeOfAFile.value, allowedToMaxSizeOfAFile.value),
          unit: setPropertyValue(jsonObject.maxSizeOfAFile && jsonObject.maxSizeOfAFile.unit, allowedToMaxSizeOfAFile.unit)
        };
        self.totalSizeOfFiles = {
          value: setPropertyValue(jsonObject.totalSizeOfFiles && jsonObject.totalSizeOfFiles.value, allowedToTotalSizeOfFiles.value),
          unit: setPropertyValue(jsonObject.totalSizeOfFiles && jsonObject.totalSizeOfFiles.unit, allowedToTotalSizeOfFiles.unit),
        };
        self.maxNumberOfFiles = setPropertyValue(jsonObject.maxNumberOfFiles, allowedToMaxNumberOfFiles.value);
        self.passwordProtected = setPropertyValue(jsonObject.passwordProtected, allowedToPasswordProtected.value);
        self.allowClosure = setPropertyValue(jsonObject.allowClosure, allowedToClosure.value);
        self.allowDeletion = setPropertyValue(jsonObject.allowDeletion, allowedToDeletion.value);
        self.notificationLanguage = setPropertyValue(jsonObject.notificationLanguage, allowedToNotificationLanguage.value);
        self.mail = setPropertyValue(jsonObject.mail, '');
        self.groupMode = setPropertyValue(jsonObject.groupMode, false);
        self.message = setPropertyValue(jsonObject.message, '');
        self.recipients = setPropertyValue(jsonObject.recipients, []);
        self.mailingListUuid = setPropertyValue(jsonObject.mailingListUuid, []);
        self.mailingList = setPropertyValue(jsonObject.mailingList, []);
        self.modificationDate = setPropertyValue(jsonObject.modificationDate, '');
        self.reset = reset;
        self.update = update;
        self.toDTO = toDTO;
        self.addRecipient = addRecipient;
        self.removeRecipient = removeRecipient;
        self.getRecipients = getRecipients;
        self.getMailingListUuid = getMailingListUuid;
        self.getMailingList = getMailingList;
        self.removeMailingList = removeMailingList;
        self.getMaxDateOfExpiration = getMaxDateOfExpiration;
        self.getMinDateOfActivation = getMinDateOfActivation;
        self.getMaxSize = getMaxSize;
        self.getMaxDateOfNotification = getMaxDateOfNotification;
        self.calculateDatePickerOptions = calculateDatePickerOptions;
        self.uuid = setPropertyValue(jsonObject.uuid, undefined);
        calculateDatePickerOptions();
        setFormValue().then(function(formData) {
          self.form = formData;
          if (!_.isUndefined(self.uuid)) {
            // TODO: Handle for update
          }
        });
      });
    }

    /**
     *  @name checkFunctionalities
     *  @desc Check the different rights relative to the uploadRequest
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function checkFunctionalities() {
      return $q.all([
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_ACTIVATION').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToActivation = clonedData;
          allowedToActivation.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
          allowedToActivation.mindate = new Date();
          allowedToActivation.original = clonedData.value;
          allowedToActivation.value = (_.isUndefined(clonedData.value) || _.isUndefined(clonedData.unit)) ? undefined : moment()
            .add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_EXPIRATION').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToExpiration = clonedData;
          allowedToExpiration.canOverride =
            _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
          allowedToExpiration.minDate = new Date();
          allowedToExpiration.original = clonedData.value;
          allowedToExpiration.value = (_.isUndefined(clonedData.value) || _.isUndefined(clonedData.unit)) ? undefined : (allowedToActivation && allowedToActivation.value ? moment(allowedToActivation.value) : moment())
            .add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_NOTIFICATION').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToExpiryNotification = clonedData;
          allowedToExpiryNotification.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
          allowedToExpiryNotification.minDate = new Date();
          allowedToExpiryNotification.original = clonedData.value;
          allowedToExpiryNotification.value = (_.isUndefined(clonedData.value) || _.isUndefined(clonedData.unit)) ? undefined : (allowedToExpiration && allowedToExpiration.value && moment(allowedToExpiration.value)
            .subtract(clonedData.value, clonedData.unit.toLowerCase()).toDate());
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_DEPOSIT_SIZE').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToTotalSizeOfFiles = clonedData;
          allowedToTotalSizeOfFiles.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_FILE_SIZE').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToMaxSizeOfAFile = clonedData;
          allowedToMaxSizeOfAFile.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_FILE_COUNT').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToMaxNumberOfFiles = clonedData;
          allowedToMaxNumberOfFiles.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__SECURED_URL').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToPasswordProtected = clonedData;
          allowedToPasswordProtected.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__CAN_DELETE').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToDeletion = clonedData;
          allowedToDeletion.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__CAN_CLOSE').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToClosure = clonedData;
          allowedToClosure.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        }),
        functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__NOTIFICATION_LANGUAGE').then(function(data) {
          var clonedData = _.cloneDeep(data || {});

          allowedToNotificationLanguage = clonedData;
          allowedToNotificationLanguage.canOverride = !!clonedData.canOverride;
        })
      ]);
    }

    /**
     *  @name create
     *  @desc Create the instatiated object by the API
     *  @returns {Object} result promise
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function create() {
      /* jshint validthis:true */
      self = this;
      var
        deferred = $q.defer(),
        uploadRequestDTO = self.toDTO();

      uploadRequestRestService.create(uploadRequestDTO, { groupMode: self.groupMode }).then(function(data) {
        deferred.resolve(data);
      }).catch(function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    /**
     *  @name toDTO
     *  @desc Build a guest DTO object from the curent guest object
     *  @returns {Object} Return a guest DTO object
     *  @memberOf LinShare.guests.GuestObjectService
     */
    function toDTO() {
      /* jshint validthis:true */
      self = this;
      var dto = {};

      dto.activationDate = self.activationDate;
      dto.expiryDate = self.expirationDate;
      dto.notificationDate = self.notificationDate;
      dto.label = self.mail;
      dto.body = self.message;
      dto.contactList = self.recipients.map(recipient => recipient.mail);
      dto.maxFileCount = self.maxNumberOfFiles;
      dto.maxDepositSize = convertToByte(self.totalSizeOfFiles);
      dto.maxFileSize = convertToByte(self.maxSizeOfAFile);
      dto.canDelete = self.allowDeletion;
      dto.canClose = self.allowClosure;
      dto.secured = self.passwordProtected;
      dto.enableNotification = true;
      dto.dirty = true;
      dto.locale = self.notificationLanguage;

      return dto;
    }

    /**
     *  @name reset
     *  @desc Reset the instatiated object to the default values
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function reset() {
      /* jshint validthis:true */
      self = this;
      self.activationDate = allowedToActivation.value;
      self.expirationDate = allowedToExpiration.value;
      self.notificationDate = allowedToExpiryNotification.value;
      self.maxSizeOfAFile = {
        value: allowedToMaxSizeOfAFile.value,
        unit: allowedToMaxSizeOfAFile.unit
      };
      self.totalSizeOfFiles = {
        value: allowedToTotalSizeOfFiles.value,
        unit: allowedToTotalSizeOfFiles.unit
      };
      self.maxNumberOfFiles = allowedToMaxNumberOfFiles.value;
      self.passwordProtected = allowedToPasswordProtected.value;
      self.allowClosure = allowedToClosure.value;
      self.allowDeletion = allowedToDeletion.value;
      self.mail = '';
      self.message = '';
    }

    /**
     *  @name setFormValue
     *  @desc Set form element value depending on ithe object property
     *  @returns {Promise}
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function setFormValue() {
      var deferred = $q.defer();

      deferred.resolve(_.cloneDeep(form));

      return deferred.promise;
    }

    /**
     *  @name setPropertyValue
     *  @desc Set element value depending on object retrieved property
     *  @param {Object} value - Value wanted to be setted
     *  @param {Object} defaultValue - The defaultValue if no object is retrieved
     *  @returns {Object} the final value to set
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function setPropertyValue(value, defaultValue) {
      return _.cloneDeep(_.isUndefined(value) ? defaultValue : value);
    }

    /**
     *  @name update
     *  @desc Update the instatiated object by the API
     *  @returns {Object} result promise
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function update() {
      /* jshint validthis:true */
      self = this;
      var
        deferred = $q.defer(),
        uploadRequestDTO = self;

      uploadRequestRestService.update(uploadRequestDTO.uuid, uploadRequestDTO).then(function(data) {
        deferred.resolve(data);
      }).catch(function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    // Autocomplete users
    function addRecipient() {
      var contact = this.selectedUser;
      var exists = false;

      switch (contact.type) {
        case 'simple':
          angular.forEach(self.recipients, function (elem) {
            if (elem.mail === contact.identifier) {
              exists = true;
              $log.info('The user ' + contact.identifier + ' is already in the recipients list');
            }
          });
          if (!exists) {
            contact.mail = contact.identifier;
            self.recipients.push(_.omit(contact, 'restrictedContacts', 'type', 'display', 'identifier'));
          }
          break;
        case 'user':
          angular.forEach(self.recipients, function (elem) {
            if (elem.mail === contact.mail && elem.domain === contact.domain) {
              exists = true;
              $log.info('The user ' + contact.mail + ' is already in the recipients list');
            }
          });
          if (!exists) {
            self.recipients.push(_.omit(contact, 'restrictedContacts', 'type', 'display', 'identifier'));
          }
          break;
        case 'mailinglist':
          _.forEach(self.mailingListUuid, function(element) {
            if (element.identifier === contact.identifier) {
              exists = true;
              $log.info('The list ' + contact.listName + ' is already in the mailinglist');
            }
          });
          if (!exists) {
            self.mailingListUuid.push(contact.identifier);
            self.mailingList.push(_.omit(contact, 'display', 'identifier'));
          }
          break;
      }
    };

    function removeRecipient(index) {
      self.recipients.splice(index, 1);
    };

    function getRecipients() {
      return self.recipients;
    };

    function getMailingListUuid() {
      return self.mailingListUuid;
    };

    function getMailingList() {
      return self.mailingList;
    };

    function removeMailingList(index) {
      self.mailingListUuid.splice(index, 1);
      self.mailingList.splice(index, 1);
    };

    function getMaxDateOfExpiration(isFormatted) {
      var maxDate = (_.isUndefined(self.allowedToExpiration.original) || _.isUndefined(self.allowedToExpiration.unit)) ? undefined :
        (self.activationDate ? moment(self.activationDate) : moment()).add(self.allowedToExpiration.original, self.allowedToExpiration.unit.toLowerCase());

      if (!isFormatted) {
        return maxDate ? maxDate.toDate() : undefined;
      };

      return maxDate ? maxDate.format('DD MMM YYYY') : undefined;
    };

    function getMinDateOfActivation(isFormatted) {
      var minDate = (_.isUndefined(self.allowedToActivation.original) || _.isUndefined(self.allowedToActivation.unit)) ? moment() :
        moment().add(self.allowedToActivation.original, self.allowedToActivation.unit.toLowerCase());

      if (!isFormatted) {
        return minDate.toDate();
      }

      return minDate.format('DD MMM YYYY');
    }

    function getMaxDateOfNotification(isFormatted) {
      var maxDate = (_.isUndefined(self.allowedToExpiryNotification.original) || _.isUndefined(self.allowedToExpiryNotification.unit)) ? undefined :
        (self.expirationDate && moment(self.expirationDate).subtract(self.allowedToExpiryNotification.original, self.allowedToExpiryNotification.unit.toLowerCase()));

      if (!isFormatted) {
        return maxDate ? maxDate.toDate() : undefined;
      }

      return maxDate ? maxDate.format('DD MMM YYYY') : undefined;
    }

    function getMaxSize(type, isFormatted) {
      var configValue, configUnit, currentUnit;

      if (type === 'total') {
        configValue = self.allowedToTotalSizeOfFiles.value;
        configUnit = self.allowedToTotalSizeOfFiles.unit;
        currentUnit = self.totalSizeOfFiles.unit;
      } else if (type === 'one') {
        configValue = self.allowedToMaxSizeOfAFile.value;
        configUnit = self.allowedToMaxSizeOfAFile.unit;
        currentUnit = self.maxSizeOfAFile.unit;
      }
      if (isFormatted) {
        return `${self.allowedToTotalSizeOfFiles.value} ${formatUnit(self.allowedToTotalSizeOfFiles.unit)}`;
      } else {
        return configValue * convertBase(currentUnit, configUnit);
      }
    }

    function calculateDatePickerOptions() {
      self.expirationDateOptions = {
        minDate: self.allowedToExpiration.minDate,
        maxDate: self.getMaxDateOfExpiration()
      };
      self.activationDateOptions = {
        minDate: self.getMinDateOfActivation(),
        maxDate: self.expirationDate
      };
      self.notificationDateOptions = {
        minDate: self.getMinDateOfActivation(),
        maxDate: self.getMaxDateOfNotification()
      };
    }

    // Helper
    function convertToByte(obj) {
      const sizes = ['Bytes', 'KILO', 'MEGA', 'GIGA'];
      const indexInSizes = sizes.indexOf(obj.unit);
      const base = 1024;

      if (indexInSizes >= 0 && obj.value >= 0) {
        return Math.pow(base, indexInSizes) * obj.value;
      }

      return 0;
    }

    function convertBase (currentUnit, configUnit) {
      const mapping = {
        'KILO': 1,
        'MEGA': 1024,
        'GIGA': 1048576
      };

      return mapping[configUnit] / mapping[currentUnit];
    }

    function formatUnit(unit) {
      switch (unit) {
        case 'KILO':
          return 'KB';
        case 'MEGA':
          return 'MB';
        case 'GIGA':
          return 'GB';
        default:
          return 'MB';
      }
    }
  }
})();
