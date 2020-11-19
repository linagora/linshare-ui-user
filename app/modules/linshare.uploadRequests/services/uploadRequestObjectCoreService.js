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
    core = {};

  return uploadRequestObjectCore;

  /**
   *  @name uploadRequestObjectCore
   *  @desc Constructor of the uploadRequestCore object
   *  @param {Object} jsonObject - Json object for constructing a uploadRequestCore object
   *  @memberOf LinShare.uploadRequests.UploadRequestObjectCoreService
   */
  function uploadRequestObjectCore(jsonObject) {
    jsonObject = jsonObject || {};

    return checkFunctionalities().then(function() {
      core.functionalityOfActivation = _.cloneDeep(functionalityOfActivation);
      core.functionalityOfExpiration = _.cloneDeep(functionalityOfExpiration);
      core.functionalityOfExpiryNotification = _.cloneDeep(functionalityOfExpiryNotification);
      core.functionalityOfTotalSizeOfFiles = _.cloneDeep(functionalityOfTotalSizeOfFiles);
      core.functionalityOfMaxSizeOfAFile = _.cloneDeep(functionalityOfMaxSizeOfAFile);
      core.functionalityOfMaxNumberOfFiles = _.cloneDeep(functionalityOfMaxNumberOfFiles);
      core.functionalityOfPasswordProtected = _.cloneDeep(functionalityOfPasswordProtected);
      core.functionalityOfDeletion = _.cloneDeep(functionalityOfDeletion);
      core.functionalityOfClosure = _.cloneDeep(functionalityOfClosure);
      core.functionalityOfNotificationLanguage = _.cloneDeep(functionalityOfNotificationLanguage);
      core.creationDate = setPropertyValue(jsonObject.creationDate, '');
      core.activationDate = setPropertyValue(jsonObject.activationDate, functionalityOfActivation.value);
      core.expiryDate = setPropertyValue(jsonObject.expiryDate, functionalityOfExpiration.value);
      core.notificationDate = setPropertyValue(jsonObject.notificationDate, functionalityOfExpiryNotification.value);
      core.maxFileCount = setPropertyValue(jsonObject.maxFileCount, functionalityOfMaxNumberOfFiles.value);
      core.secured = setPropertyValue(jsonObject.secured, functionalityOfPasswordProtected.value);
      core.allowClosure = setPropertyValue(jsonObject.allowClosure, functionalityOfClosure.value);
      core.allowDeletion = setPropertyValue(jsonObject.allowDeletion, functionalityOfDeletion.value);
      core.notificationLanguage = setPropertyValue(jsonObject.notificationLanguage, functionalityOfNotificationLanguage.value);
      core.label = setPropertyValue(jsonObject.label, '');
      core.owner = setPropertyValue(jsonObject.owner, {});
      core.groupMode = setPropertyValue(jsonObject.groupMode, false);
      core.body = setPropertyValue(jsonObject.body, '');
      core.recipients = setPropertyValue(jsonObject.recipients, []);
      core.modificationDate = setPropertyValue(jsonObject.modificationDate, '');
      core.maxSizeOfAFile = setAppropriateSize(jsonObject.maxFileSize) || functionalityOfMaxSizeOfAFile;
      core.totalSizeOfFiles = setAppropriateSize(jsonObject.maxDepositSize) || functionalityOfTotalSizeOfFiles;
      core.getMaxDateOfExpiration = getMaxDateOfExpiration;
      core.getMinDateOfActivation = getMinDateOfActivation;
      core.getMaxSize = getMaxSize;
      core.getMinDateOfNotification = getMinDateOfNotification;
      core.getMaxDateOfNotification = getMaxDateOfNotification;
      core.calculateDatePickerOptions = calculateDatePickerOptions;
      core.uuid = setPropertyValue(jsonObject.uuid, null);
      core.getOwnerNameOrEmail = getOwnerNameOrEmail;

      calculateDatePickerOptions();

      return core;
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
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_DEPOSIT_SIZE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfTotalSizeOfFiles = clonedData;
        functionalityOfTotalSizeOfFiles.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        functionalityOfTotalSizeOfFiles.unit = unitService.formatUnit(clonedData.unit);
        functionalityOfTotalSizeOfFiles.canOverride = _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__MAXIMUM_FILE_SIZE').then(data => {
        const clonedData = _.cloneDeep(data || {});

        functionalityOfMaxSizeOfAFile = clonedData;
        functionalityOfMaxSizeOfAFile.maxValue = clonedData.maxValue > 0 ? clonedData.maxValue : null;
        functionalityOfMaxSizeOfAFile.unit = unitService.formatUnit(clonedData.unit);
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

  function getMaxDateOfExpiration(isFormatted) {
    if (core.functionalityOfExpiration.maxValue < 0) {
      return;
    }

    const activationDate = core.activationDate ? moment(core.activationDate) : moment();
    const maxDate = !_.isUndefined(core.functionalityOfExpiration.maxValue)
      && core.functionalityOfExpiration.unit
      && activationDate.add(core.functionalityOfExpiration.maxValue, core.functionalityOfExpiration.unit.toLowerCase());

    if (!isFormatted) {
      return maxDate && maxDate.toDate();
    };

    return maxDate && maxDate.format('DD MMM YYYY');
  };

  function getMinDateOfActivation(isFormatted) {
    if (core.functionalityOfActivation.maxValue < 0) {
      return !isFormatted ? new Date() : moment().format('DD MMM YYYY');
    }

    const minDate = !_.isUndefined(core.functionalityOfActivation.maxValue) && core.functionalityOfActivation.unit
      ? moment().add(core.functionalityOfActivation.maxValue, core.functionalityOfActivation.unit.toLowerCase())
      : moment();

    if (!isFormatted) {
      return minDate.toDate();
    }

    return minDate.format('DD MMM YYYY');
  }

  function getMinDateOfNotification(isFormatted) {
    const expirationDate = core.expiryDate && moment(core.expiryDate);
    const activationDate = core.activationDate ? moment(core.activationDate) : moment();

    if (core.functionalityOfExpiryNotification.maxValue <= 0) {
      return !isFormatted ? (activationDate && activationDate.toDate())
        : (activationDate && activationDate.format('DD MMM YYYY'));
    }

    let minDate = !_.isUndefined(core.functionalityOfExpiryNotification.maxValue)
      && core.functionalityOfExpiryNotification.unit
      && expirationDate
      && expirationDate.subtract(core.functionalityOfExpiryNotification.maxValue, core.functionalityOfExpiryNotification.unit.toLowerCase());

    if (minDate.valueOf() < activationDate.valueOf()) {
      minDate = activationDate;
    }

    if (!isFormatted) {
      return minDate && minDate.toDate();
    }

    return minDate && minDate.format('DD MMM YYYY');
  }

  function getMaxDateOfNotification(isFormatted) {
    const expirationDate = core.expiryDate ? moment(core.expiryDate) : moment(core.getMaxDateOfExpiration());

    if (!isFormatted) {
      return expirationDate && expirationDate.toDate();
    }

    return expirationDate && expirationDate.format('DD MMM YYYY');
  }

  function getMaxSize(type, isFormatted) {
    let configMaxValue, configUnit, currentUnit;

    if (type === 'total') {
      configMaxValue = core.functionalityOfTotalSizeOfFiles.maxValue;
      configUnit = core.functionalityOfTotalSizeOfFiles.unit;
      currentUnit = core.totalSizeOfFiles.unit;
    } else if (type === 'one') {
      configMaxValue = core.functionalityOfMaxSizeOfAFile.maxValue;
      configUnit = core.functionalityOfMaxSizeOfAFile.unit;
      currentUnit = core.maxSizeOfAFile.unit;
    }

    const maxValue = configMaxValue && configUnit && currentUnit ? configMaxValue * unitService.convertBase(currentUnit, configUnit) : null;

    if (isFormatted) {
      return `${maxValue} ${unitService.formatUnit(configUnit)}`;
    } else {
      return maxValue;
    }
  }

  function calculateDatePickerOptions() {
    core.expirationDateOptions = {
      minDate: core.activationDate,
      maxDate: core.getMaxDateOfExpiration()
    };
    core.activationDateOptions = {
      minDate: core.getMinDateOfActivation(),
      maxDate: core.expiryDate
    };
    core.notificationDateOptions = {
      minDate: core.getMinDateOfNotification(),
      maxDate: core.getMaxDateOfNotification()
    };
  }

  function getOwnerNameOrEmail() {
    if (core.owner.firstName && core.owner.lastName) {
      return `${core.owner.firstName}  ${core.owner.lastName}`;
    }

    return core.owner.mail;
  }

  function setAppropriateSize(value) {
    if (!value) {
      return;
    }
    const appropriateUnit = unitService.find(value);
    const convertedValue = unitService.byteTo(value, appropriateUnit);

    return {
      value: convertedValue,
      unit: appropriateUnit
    };
  }
}
