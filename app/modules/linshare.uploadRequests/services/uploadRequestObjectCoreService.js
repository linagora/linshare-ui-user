angular
  .module('linshare.uploadRequests')
  .factory('UploadRequestObjectCoreService', UploadRequestObjectCoreService);

UploadRequestObjectCoreService.$inject = [
  '_',
  '$q',
  'functionalityRestService',
  'moment',
  'unitService'
];

/**
 *  @namespace UploadRequestObjectCoreService
 *  @desc Manipulation of uploadRequest object front/back
 *  @memberOf LinShare.uploadRequest
 */
function UploadRequestObjectCoreService(
  _,
  $q,
  functionalityRestService,
  moment,
  unitService
) {
  let
    functionalityOfActivation = {},
    functionalityOfExpiration = {},
    functionalityOfExpiryNotification = {},
    functionalityOfTotalSizeOfFiles = {},
    functionalityOfMaxSizeOfAFile = {},
    functionalityOfMaxNumberOfFiles = {},
    functionalityOfPasswordProtected = {},
    functionalityOfDeletion = {},
    functionalityOfClosure = {},
    functionalityOfNotificationLanguage = {},
    self = {};

  return uploadRequestObjectCore;

  /**
   *  @name uploadRequestObjectCore
   *  @desc Constructor of the uploadRequestCore object
   *  @param {Object} jsonObject - Json object for constructing a uploadRequestCore object
   *  @memberOf LinShare.uploadRequests.UploadRequestObjectCoreService
   */
  function uploadRequestObjectCore(jsonObject = {}) {
    self = this;

    checkFunctionalities().then(function() {
      /**
   *  @name setPropertyValue
   *  @desc Set element value depending on object retrieved property
   *  @param {Object} value - Value wanted to be setted
   *  @param {Object} defaultValue - The defaultValue if no object is retrieved
   *  @returns {Object} the final value to set
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
      function setPropertyValue(value, defaultValue) {
        return _.cloneDeep(_.isUndefined(jsonObject.uuid) ? defaultValue : value);
      }

      self.functionalityOfActivation = _.cloneDeep(functionalityOfActivation);
      self.functionalityOfExpiration = _.cloneDeep(functionalityOfExpiration);
      self.functionalityOfExpiryNotification = _.cloneDeep(functionalityOfExpiryNotification);
      self.functionalityOfTotalSizeOfFiles = _.cloneDeep(functionalityOfTotalSizeOfFiles);
      self.functionalityOfMaxSizeOfAFile = _.cloneDeep(functionalityOfMaxSizeOfAFile);
      self.functionalityOfMaxNumberOfFiles = _.cloneDeep(functionalityOfMaxNumberOfFiles);
      self.functionalityOfPasswordProtected = _.cloneDeep(functionalityOfPasswordProtected);
      self.functionalityOfDeletion = _.cloneDeep(functionalityOfDeletion);
      self.functionalityOfClosure = _.cloneDeep(functionalityOfClosure);
      self.functionalityOfNotificationLanguage = _.cloneDeep(functionalityOfNotificationLanguage);
      self.creationDate = setPropertyValue(jsonObject.creationDate, '');
      self.activationDate = setPropertyValue(jsonObject.activationDate, functionalityOfActivation.value);
      self.expiryDate = setPropertyValue(jsonObject.expiryDate, functionalityOfExpiration.value);
      self.notificationDate = setPropertyValue(jsonObject.notificationDate, functionalityOfExpiryNotification.value);
      self.maxFileCount = setPropertyValue(jsonObject.maxFileCount, functionalityOfMaxNumberOfFiles.value);
      self.protectedByPassword = setPropertyValue(jsonObject.protectedByPassword, functionalityOfPasswordProtected.value);
      self.canClose = setPropertyValue(jsonObject.canClose, functionalityOfClosure.value);
      self.canDelete = setPropertyValue(jsonObject.canDelete, functionalityOfDeletion.value);
      self.canDeleteDocument = setPropertyValue(jsonObject.canDeleteDocument, functionalityOfDeletion.value);
      self.locale = setPropertyValue(jsonObject.locale, functionalityOfNotificationLanguage.value);
      self.label = setPropertyValue(jsonObject.label, '');
      self.owner = setPropertyValue(jsonObject.owner, {});
      self.collective = jsonObject.collective || false;
      self.body = setPropertyValue(jsonObject.body, '');
      self.recipients = setPropertyValue(jsonObject.recipients, []);
      self.modificationDate = setPropertyValue(jsonObject.modificationDate, '');
      self.maxSizeOfAFile = setAppropriateSize(jsonObject.maxFileSize) || functionalityOfMaxSizeOfAFile;
      self.totalSizeOfFiles = setAppropriateSize(jsonObject.maxDepositSize) || functionalityOfTotalSizeOfFiles;
      self.nbrUploadedFiles = setPropertyValue(jsonObject.nbrUploadedFiles, 0);
      self.getMinDateOfExpiration = getMinDateOfExpiration;
      self.getMaxDateOfExpiration = getMaxDateOfExpiration;
      self.getMaxDateOfActivation = getMaxDateOfActivation;
      self.getMinDateOfActivation = getMinDateOfActivation;
      self.getMaxSize = getMaxSize;
      self.getMinDateOfNotification = getMinDateOfNotification;
      self.getMaxDateOfNotification = getMaxDateOfNotification;
      self.calculateDatePickerOptions = calculateDatePickerOptions;
      self.uuid = setPropertyValue(jsonObject.uuid, null);
      self.status = jsonObject.status;
      self.getOwnerNameOrEmail = getOwnerNameOrEmail;
      self.calculateMaxSize = calculateMaxSize;

      calculateDatePickerOptions();
      calculateMaxSize('total');
      calculateMaxSize('one');
    });
  }

  /**
   *  @name checkFunctionalities
   *  @desc Check the different rights relative to the uploadRequest
   *  @memberOf LinShare.uploadRequests.UploadRequestObjectCoreService
   */
  function checkFunctionalities() {
    return $q.all([
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_ACTIVATION').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfActivation = clonedData;
        functionalityOfActivation.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        functionalityOfActivation.value = !_.isUndefined(clonedData.value)
          && clonedData.unit
          && moment().add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_EXPIRATION').then(data => {
        const clonedData = _.cloneDeep(data || {});
        const defaultActivationDate = functionalityOfActivation && functionalityOfActivation.value ? moment(functionalityOfActivation.value) : moment();

        functionalityOfExpiration = clonedData;
        functionalityOfExpiration.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        functionalityOfExpiration.value = !_.isUndefined(clonedData.value)
          && clonedData.unit
          && defaultActivationDate.add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_NOTIFICATION').then(data => {
        const clonedData = _.cloneDeep(data || {});
        const defaultExpirationDate = functionalityOfExpiration && functionalityOfExpiration.value && moment(functionalityOfExpiration.value);

        functionalityOfExpiryNotification = clonedData;
        functionalityOfExpiryNotification.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        functionalityOfExpiryNotification.value = !_.isUndefined(clonedData.value)
          && clonedData.unit
          && defaultExpirationDate
          && defaultExpirationDate.subtract(clonedData.value, clonedData.unit.toLowerCase()).toDate();
        functionalityOfExpiryNotification.enable = functionalityOfExpiration.enable ? functionalityOfExpiryNotification.enable : false;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_DEPOSIT_SIZE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfTotalSizeOfFiles = clonedData;
        functionalityOfTotalSizeOfFiles.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        functionalityOfTotalSizeOfFiles.unit = unitService.formatUnit(clonedData.unit);
        functionalityOfTotalSizeOfFiles.maxUnit = unitService.formatUnit(clonedData.maxUnit);
        functionalityOfTotalSizeOfFiles.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_FILE_SIZE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfMaxSizeOfAFile = clonedData;
        functionalityOfMaxSizeOfAFile.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        functionalityOfMaxSizeOfAFile.unit = unitService.formatUnit(clonedData.unit);
        functionalityOfMaxSizeOfAFile.maxUnit = unitService.formatUnit(clonedData.maxUnit);
        functionalityOfMaxSizeOfAFile.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_FILE_COUNT').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfMaxNumberOfFiles = clonedData;
        functionalityOfMaxNumberOfFiles.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        functionalityOfMaxNumberOfFiles.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__SECURED_URL').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfPasswordProtected = clonedData;
        functionalityOfPasswordProtected.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__CAN_DELETE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfDeletion = clonedData;
        functionalityOfDeletion.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__CAN_CLOSE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfClosure = clonedData;
        functionalityOfClosure.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__NOTIFICATION_LANGUAGE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfNotificationLanguage = clonedData;
        functionalityOfNotificationLanguage.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      })
    ]);
  }

  function getMinDateOfExpiration(format) {
    return format ? moment(self.activationDate).format(format) : self.activationDate;
  }

  function getMaxDateOfExpiration(format) {
    if (self.functionalityOfExpiration.maxValue < 0) {
      return;
    }

    const activationDate = self.activationDate ? moment(self.activationDate) : moment();
    const maxDate = !_.isUndefined(self.functionalityOfExpiration.maxValue)
      && self.functionalityOfExpiration.maxUnit
      && activationDate.add(self.functionalityOfExpiration.maxValue, self.functionalityOfExpiration.maxUnit.toLowerCase());

    if (!format) {
      return maxDate && maxDate.toDate();
    };

    return maxDate && maxDate.format(format);
  };

  function getMinDateOfActivation(format) {
    const minDate = self.uuid ? moment().add(1, 'day') : moment();

    return format ? minDate.format(format) : minDate;
  }

  function getMaxDateOfActivation(format) {
    if (self.functionalityOfActivation.maxValue < 0) {
      return;
    }

    const expiryDate = self.expiryDate && moment(self.expiryDate);
    let maxDate = !_.isUndefined(self.functionalityOfActivation.maxValue) && self.functionalityOfActivation.maxUnit
      ? moment().add(self.functionalityOfActivation.maxValue, self.functionalityOfActivation.maxUnit.toLowerCase())
      : expiryDate;

    if (expiryDate && maxDate && maxDate.valueOf() > expiryDate.valueOf()) {
      maxDate = expiryDate;
    }

    if (!format) {
      return maxDate.toDate();
    }

    return maxDate.format(format);
  }

  function getMinDateOfNotification(format) {
    const expirationDate = self.expiryDate && moment(self.expiryDate);
    const activationDate = self.activationDate ? moment(self.activationDate) : moment();

    if (self.functionalityOfExpiryNotification.maxValue <= 0) {
      let minDate = activationDate;

      if (minDate.valueOf() < moment().valueOf()) {
        minDate = moment();
      }

      return !format ? minDate.toDate() : minDate.format(format);
    }

    let minDate = !_.isUndefined(self.functionalityOfExpiryNotification.maxValue)
      && self.functionalityOfExpiryNotification.maxUnit
      && expirationDate
      && expirationDate.subtract(self.functionalityOfExpiryNotification.maxValue, self.functionalityOfExpiryNotification.maxUnit.toLowerCase());

    if (minDate.valueOf() < activationDate.valueOf()) {
      minDate = activationDate;
    }

    if (minDate.valueOf() < moment().valueOf()) {
      minDate = moment();
    }

    if (!format) {
      return minDate && minDate.toDate();
    }

    return minDate && minDate.format(format);
  }

  function getMaxDateOfNotification(format) {
    const expirationDate = self.expiryDate ? moment(self.expiryDate) : moment(self.getMaxDateOfExpiration());

    if (!format) {
      return expirationDate && expirationDate.toDate();
    }

    return expirationDate && expirationDate.format(format);
  }

  function calculateMaxSize(type) {
    if (type === 'total') {
      self.totalSizeOfFiles.maxValue = getMaxSize('total');
    }

    if (type === 'one') {
      self.maxSizeOfAFile.maxValue = getMaxSize('one');
    }
  }

  function getMaxSize(type, isFormatted) {
    let configMaxValue, configUnit, currentUnit;

    if (type === 'total') {
      configMaxValue = self.functionalityOfTotalSizeOfFiles.maxValue;
      configUnit = self.functionalityOfTotalSizeOfFiles.maxUnit;
      currentUnit = self.totalSizeOfFiles.unit;
    } else if (type === 'one') {
      configMaxValue = self.functionalityOfMaxSizeOfAFile.maxValue;
      configUnit = self.functionalityOfMaxSizeOfAFile.maxUnit;
      currentUnit = self.maxSizeOfAFile.unit;
    }

    const maxValue = configMaxValue && configUnit && currentUnit ? configMaxValue * unitService.convertBase(currentUnit, configUnit) : null;

    if (isFormatted) {
      return `${configMaxValue} ${configUnit}`;
    } else {
      return maxValue;
    }
  }

  function calculateDatePickerOptions() {
    self.expirationDateOptions = {
      minDate: self.activationDate,
      maxDate: self.getMaxDateOfExpiration(),
      minHTMLDate: moment(self.activationDate).format('YYYY-MM-DD'),
      maxHTMLDate: self.getMaxDateOfExpiration('YYYY-MM-DD')
    };
    self.activationDateOptions = {
      minDate: self.getMinDateOfActivation(),
      maxDate: self.getMaxDateOfActivation(),
      minHTMLDate: self.getMinDateOfActivation('YYYY-MM-DD'),
      maxHTMLDate: self.getMaxDateOfActivation('YYYY-MM-DD'),
    };
    self.notificationDateOptions = {
      minDate: self.getMinDateOfNotification(),
      maxDate: self.getMaxDateOfNotification(),
      minHTMLDate: self.getMinDateOfNotification('YYYY-MM-DD'),
      maxHTMLDate: self.getMaxDateOfNotification('YYYY-MM-DD')
    };
  }

  function getOwnerNameOrEmail() {
    if (self.owner.firstName && self.owner.lastName) {
      return `${self.owner.firstName}  ${self.owner.lastName}`;
    }

    return self.owner.mail;
  }

  function setAppropriateSize(value) {
    if (!value) {
      return;
    }
    const appropriateUnit = unitService.find(value, { upperbound: 'GB', lowerbound: 'KB' });
    const convertedValue = unitService.byteTo(value, appropriateUnit);

    return {
      value: convertedValue,
      unit: appropriateUnit
    };
  }
}
