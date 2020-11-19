angular
  .module('linshare.uploadRequests')
  .factory('UploadRequestGroupObjectService', UploadRequestGroupObjectService);

UploadRequestGroupObjectService.$inject = [
  '_',
  '$q',
  'functionalityRestService',
  'uploadRequestGroupRestService',
  'moment',
  '$log',
  'unitService',
  'toastService',
  'uploadRequestUtilsService'
];

/**
 *  @namespace UploadRequestGroupObjectService
 *  @desc Manipulation of uploadRequest object front/back
 *  @memberOf LinShare.uploadRequest
 */
function UploadRequestGroupObjectService(
  _,
  $q,
  functionalityRestService,
  uploadRequestGroupRestService,
  moment,
  $log,
  unitService,
  toastService,
  uploadRequestUtilsService
) {
  const { showToastAlertFor, openWarningDialogFor } = uploadRequestUtilsService;
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
    self;

  return uploadRequestGroupObject;

  /**
   *  @name uploadRequestGroupObject
   *  @desc Constructor of the uploadRequest object
   *  @param {Object} jsonObject - Json object for constructing a uploadRequest object
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function uploadRequestGroupObject(jsonObject, options = {}) {
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
      self.update = update;
      self.creationDate = setPropertyValue(jsonObject.creationDate, '');
      self.domain = setPropertyValue(jsonObject.domain, '');
      self.activationDate = setPropertyValue(jsonObject.activationDate, allowedToActivation.value);
      self.expiryDate = setPropertyValue(jsonObject.expiryDate, allowedToExpiration.value);
      self.notificationDate = setPropertyValue(jsonObject.notificationDate, allowedToExpiryNotification.value);
      self.maxSizeOfAFile = {
        value: setPropertyValue(jsonObject.maxFileSize &&
          unitService.byteTo(jsonObject.maxFileSize, unitService.formatUnit(allowedToMaxSizeOfAFile.unit)), allowedToMaxSizeOfAFile.value),
        unit: setPropertyValue(unitService.formatUnit(allowedToMaxSizeOfAFile.unit))
      };
      self.totalSizeOfFiles = {
        value: setPropertyValue(jsonObject.maxDepositSize &&
          unitService.byteTo(jsonObject.maxDepositSize, unitService.formatUnit(allowedToTotalSizeOfFiles.unit)), allowedToTotalSizeOfFiles.value),
        unit: setPropertyValue(unitService.formatUnit(allowedToTotalSizeOfFiles.unit)),
      };
      self.maxFileCount = setPropertyValue(jsonObject.maxFileCount, allowedToMaxNumberOfFiles.value);
      self.secured = setPropertyValue(jsonObject.secured, allowedToPasswordProtected.value);
      self.allowClosure = setPropertyValue(jsonObject.allowClosure, allowedToClosure.value);
      self.allowDeletion = setPropertyValue(jsonObject.allowDeletion, allowedToDeletion.value);
      self.notificationLanguage = setPropertyValue(jsonObject.notificationLanguage, allowedToNotificationLanguage.value);
      self.label = setPropertyValue(jsonObject.label, '');
      self.owner = setPropertyValue(jsonObject.owner, {});
      self.groupMode = setPropertyValue(jsonObject.groupMode, false);
      self.body = setPropertyValue(jsonObject.body, '');
      self.recipients = setPropertyValue(jsonObject.recipients, []);
      self.newRecipients = [];
      self.modificationDate = setPropertyValue(jsonObject.modificationDate, '');
      self.toDTO = toDTO;
      self.toUpdateDTO = toUpdateDTO;
      self.addRecipient = addRecipient;
      self.removeRecipient = removeRecipient;
      self.removeNewRecipient = removeNewRecipient;
      self.getRecipients = getRecipients;
      self.getNewRecipients = getNewRecipients;
      self.getMaxDateOfExpiration = getMaxDateOfExpiration;
      self.getMinDateOfActivation = getMinDateOfActivation;
      self.getMaxSize = getMaxSize;
      self.getMinDateOfNotification = getMinDateOfNotification;
      self.getMaxDateOfNotification = getMaxDateOfNotification;
      self.calculateDatePickerOptions = calculateDatePickerOptions;
      self.uuid = setPropertyValue(jsonObject.uuid, null);
      self.submitRecipients = submitRecipients;
      self.getOwnerNameOrEmail = getOwnerNameOrEmail;
      self.submitRecipientsCallback = options.submitRecipientsCallback;

      calculateDatePickerOptions();
    });
  }

  /**
   *  @name checkFunctionalities
   *  @desc Check the different rights relative to the uploadRequest
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function checkFunctionalities() {
    return $q.all([
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_ACTIVATION').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToActivation = clonedData;
        allowedToActivation.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        allowedToActivation.value = !_.isUndefined(clonedData.value)
          && clonedData.unit
          && moment().add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_EXPIRATION').then(data => {
        const clonedData = _.cloneDeep(data || {});
        const defaultActivationDate = allowedToActivation && allowedToActivation.value ? moment(allowedToActivation.value) : moment();

        allowedToExpiration = clonedData;
        allowedToExpiration.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        allowedToExpiration.value = !_.isUndefined(clonedData.value)
          && clonedData.unit
          && defaultActivationDate.add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_NOTIFICATION').then(data => {
        const clonedData = _.cloneDeep(data || {});
        const defaultExpirationDate = allowedToExpiration && allowedToExpiration.value && moment(allowedToExpiration.value);

        allowedToExpiryNotification = clonedData;
        allowedToExpiryNotification.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        allowedToExpiryNotification.value = !_.isUndefined(clonedData.value)
          && clonedData.unit
          && defaultExpirationDate
          && defaultExpirationDate.subtract(clonedData.value, clonedData.unit.toLowerCase()).toDate();
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_DEPOSIT_SIZE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToTotalSizeOfFiles = clonedData;
        allowedToTotalSizeOfFiles.unit = unitService.formatUnit(clonedData.unit);
        allowedToTotalSizeOfFiles.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        allowedToTotalSizeOfFiles.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_FILE_SIZE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToMaxSizeOfAFile = clonedData;
        allowedToMaxSizeOfAFile.unit = unitService.formatUnit(clonedData.unit);
        allowedToMaxSizeOfAFile.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        allowedToMaxSizeOfAFile.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_FILE_COUNT').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToMaxNumberOfFiles = clonedData;
        allowedToMaxNumberOfFiles.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        allowedToMaxNumberOfFiles.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__SECURED_URL').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToPasswordProtected = clonedData;
        allowedToPasswordProtected.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__CAN_DELETE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToDeletion = clonedData;
        allowedToDeletion.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__CAN_CLOSE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToClosure = clonedData;
        allowedToClosure.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__NOTIFICATION_LANGUAGE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        allowedToNotificationLanguage = clonedData;
        allowedToNotificationLanguage.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      })
    ]);
  }

  /**
   *  @name create
   *  @desc Create the instatiated object by the API
   *  @returns {Object} result promise
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function create() {
    self = this;

    return uploadRequestGroupRestService.create(self.toDTO(), { groupMode: self.groupMode });
  }

  /**
   *  @name update
   *  @desc Update the instatiated object by the API
   *  @returns {Object} result promise
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function update() {
    self = this;

    return uploadRequestGroupRestService.update(self.uuid, self.toUpdateDTO());
  }

  /**
   *  @name toDTO
   *  @desc Build an upload request group DTO from the current upload request group object
   *  @returns {Object} Return a urg DTO object
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function toDTO() {
    self = this;
    const dto = {};

    dto.activationDate = self.activationDate && moment(self.activationDate).valueOf();
    dto.expiryDate = self.expiryDate && moment(self.expiryDate).valueOf();
    dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf();
    dto.label = self.label;
    dto.body = self.body;
    dto.contactList = self.newRecipients.map(recipient => recipient.mail);
    dto.maxFileCount = self.maxFileCount;
    dto.maxDepositSize = unitService.toByte(self.totalSizeOfFiles.value, self.totalSizeOfFiles.unit);
    dto.maxFileSize = unitService.toByte(self.maxSizeOfAFile.value, self.maxSizeOfAFile.unit);
    dto.canDelete = self.allowDeletion;
    dto.canClose = self.allowClosure;
    dto.secured = self.secured;
    dto.enableNotification = true;
    dto.dirty = true;
    dto.locale = self.notificationLanguage;

    return dto;
  }

  /**
   *  @name toUpdateDTO
   *  @desc Build a DTO object from the current object for updating
   *  @returns {Object} Return a DTO object
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function toUpdateDTO() {
    self = this;
    const dto = {};

    dto.activationDate = self.activationDate && moment(self.activationDate).valueOf();
    dto.expiryDate = self.expiryDate && moment(self.expiryDate).valueOf();
    dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf();
    dto.label = self.label;
    dto.body = self.body;
    dto.maxFileCount = self.maxFileCount;
    dto.maxDepositSize = unitService.toByte(self.totalSizeOfFiles.value, self.totalSizeOfFiles.unit);
    dto.maxFileSize = unitService.toByte(self.maxSizeOfAFile.value, self.maxSizeOfAFile.unit);
    dto.canDelete = self.allowDeletion;
    dto.canClose = self.allowClosure;
    dto.secured = self.secured;
    dto.enableNotification = true;
    dto.locale = self.notificationLanguage;

    return dto;
  }

  /**
   *  @name setPropertyValue
   *  @desc Set element value depending on object retrieved property
   *  @param {Object} value - Value wanted to be setted
   *  @param {Object} defaultValue - The defaultValue if no object is retrieved
   *  @returns {Object} the final value to set
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function setPropertyValue(value, defaultValue) {
    return _.cloneDeep(_.isUndefined(value) ? defaultValue : value);
  }

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
        const uniqueInitialRecipients = _.uniqBy(self.recipients, 'mail');

        uniqueInitialRecipients.forEach(initialRecipient => {
          if (initialRecipient.mail === contact.mail) {
            exists = true;
            toastService.error({key: 'TOAST_ALERT.WARNING.EMAIL_ALREADY_IN_UPLOAD_REQUEST'});
            $log.info('The user ' + contact.mail + ' is already in the upload request');
          }
        });

        self.newRecipients.forEach(newRecipient => {
          if (newRecipient.mail === contact.mail) {
            exists = true;
            $log.info('The user ' + contact.mail + ' is already in the recipients list');
          }
        });

        if (!exists) {
          const { firstName, lastName, mail } = contact;

          self.newRecipients.push({ firstName, lastName, mail });
        }
        break;
    }
  };

  function removeRecipient(index) {
    self.recipients.splice(index, 1);
  };

  function removeNewRecipient(index) {
    self.newRecipients.splice(index, 1);
  };


  function getRecipients() {
    return self.recipients;
  };

  function getNewRecipients() {
    return self.newRecipients;
  }

  function getMaxDateOfExpiration(isFormatted) {
    if (self.allowedToExpiration.maxValue < 0) {
      return;
    }

    const activationDate = self.activationDate ? moment(self.activationDate) : moment();
    const maxDate = !_.isUndefined(self.allowedToExpiration.maxValue)
      && self.allowedToExpiration.unit
      && activationDate.add(self.allowedToExpiration.maxValue, self.allowedToExpiration.unit.toLowerCase());

    if (!isFormatted) {
      return maxDate && maxDate.toDate();
    };

    return maxDate && maxDate.format('DD MMM YYYY');
  };

  function getMinDateOfActivation(isFormatted) {
    if (self.allowedToActivation.maxValue < 0) {
      return !isFormatted ? new Date() : moment().format('DD MMM YYYY');
    }

    const minDate = !_.isUndefined(self.allowedToActivation.maxValue) && self.allowedToActivation.unit
      ? moment().add(self.allowedToActivation.maxValue, self.allowedToActivation.unit.toLowerCase())
      : moment();

    if (!isFormatted) {
      return minDate.toDate();
    }

    return minDate.format('DD MMM YYYY');
  }

  function getMinDateOfNotification(isFormatted) {
    const expirationDate = self.expiryDate && moment(self.expiryDate);
    const activationDate = self.activationDate ? moment(self.activationDate) : moment();

    if (self.allowedToExpiryNotification.maxValue <= 0) {
      return !isFormatted ? (activationDate && activationDate.toDate())
        : (activationDate && activationDate.format('DD MMM YYYY'));
    }

    let minDate = !_.isUndefined(self.allowedToExpiryNotification.maxValue)
      && self.allowedToExpiryNotification.unit
      && expirationDate
      && expirationDate.subtract(self.allowedToExpiryNotification.maxValue, self.allowedToExpiryNotification.unit.toLowerCase());

    if (minDate.valueOf() < activationDate.valueOf()) {
      minDate = activationDate;
    }

    if (!isFormatted) {
      return minDate && minDate.toDate();
    }

    return minDate && minDate.format('DD MMM YYYY');
  }

  function getMaxDateOfNotification(isFormatted) {
    const expirationDate = self.expiryDate ? moment(self.expiryDate) : moment(self.getMaxDateOfExpiration());

    if (!isFormatted) {
      return expirationDate && expirationDate.toDate();
    }

    return expirationDate && expirationDate.format('DD MMM YYYY');
  }

  function getMaxSize(type, isFormatted) {
    var configMaxValue, configUnit, currentUnit;

    if (type === 'total') {
      configMaxValue = self.allowedToTotalSizeOfFiles.maxValue;
      configUnit = self.allowedToTotalSizeOfFiles.unit;
      currentUnit = self.totalSizeOfFiles.unit;
    } else if (type === 'one') {
      configMaxValue = self.allowedToMaxSizeOfAFile.maxValue;
      configUnit = self.allowedToMaxSizeOfAFile.unit;
      currentUnit = self.maxSizeOfAFile.unit;
    }

    const maxValue = configMaxValue && configUnit && currentUnit ? configMaxValue * unitService.convertBase(currentUnit, configUnit) : null;

    if (isFormatted) {
      return `${maxValue} ${configUnit}`;
    } else {
      return maxValue;
    }
  }

  function calculateDatePickerOptions() {
    self.expirationDateOptions = {
      minDate: self.activationDate,
      maxDate: self.getMaxDateOfExpiration()
    };
    self.activationDateOptions = {
      minDate: self.getMinDateOfActivation(),
      maxDate: self.expiryDate
    };
    self.notificationDateOptions = {
      minDate: self.getMinDateOfNotification(),
      maxDate: self.getMaxDateOfNotification()
    };
  }

  function submitRecipients() {
    if (self.getNewRecipients().length === 0) {
      toastService.error({key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT_UPLOAD_REQUEST'});

      return;
    }

    return openWarningDialogFor('add_recipients', self.newRecipients)
      .then(() => uploadRequestGroupRestService.addRecipients(self.uuid, self.newRecipients))
      .then(() => {
        showToastAlertFor('add_recipients', 'info', self.newRecipients);

        if (self.submitRecipientsCallback) {
          self.submitRecipientsCallback();
        }

        self.recipients = [...self.recipients, ...self.newRecipients];
        self.newRecipients = [];

      }).catch(err => {
        if (err) {
          showToastAlertFor('add_recipients', 'error', self.recipients);
        }
      });
  }

  function getOwnerNameOrEmail() {
    if (self.owner.firstName && self.owner.lastName) {
      return `${self.owner.firstName}  ${self.owner.lastName}`;
    }

    return self.owner.mail;
  }
}
