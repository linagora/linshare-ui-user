/**
 * UploadRequestObjectService Factory
 * @namespace LinShare.uploadRequests
 */

angular
  .module('linshare.uploadRequests')
  .factory('UploadRequestObjectService', UploadRequestObjectService);

UploadRequestObjectService.$inject = [
  '_',
  '$q',
  'functionalityRestService',
  'unitService',
  'moment'
];

/**
   *  @namespace UploadRequestObjectService
   *  @desc Manipulation of uploadRequest object front/back
   *  @memberOf LinShare.uploadRequest
   */
function UploadRequestObjectService(
  _,
  $q,
  functionalityRestService,
  unitService,
  moment
) {

  let
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
    checkFunctionalities().then(() => {
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
      self.creationDate = setPropertyValue(jsonObject.creationDate, '');
      self.modificationDate = setPropertyValue(jsonObject.modificationDate, '');
      self.activationDate = setPropertyValue(jsonObject.activationDate, allowedToActivation.value);
      self.expirationDate = setPropertyValue(jsonObject.expirationDate, allowedToExpiration.value);
      self.notificationDate = setPropertyValue(jsonObject.notificationDate, allowedToExpiryNotification.value);
      self.maxSizeOfAFile = setPropertyValue(jsonObject.maxFileSize, allowedToMaxSizeOfAFile.value);
      self.filesUploaded = setPropertyValue(jsonObject.filesUploaded, 0);
      self.maxNumberOfFiles = setPropertyValue(jsonObject.maxFileCount, allowedToMaxNumberOfFiles.value);
      self.passwordProtected = setPropertyValue(jsonObject.passwordProtected, allowedToPasswordProtected.value);
      self.allowClosure = setPropertyValue(jsonObject.canClose, allowedToClosure.value);
      self.allowDeletion = setPropertyValue(jsonObject.canDelete, allowedToDeletion.value);
      self.notificationLanguage = setPropertyValue(jsonObject.locale, allowedToNotificationLanguage.value);
      self.groupMode = setPropertyValue(jsonObject.groupMode, false);
      self.body = setPropertyValue(jsonObject.body, '');
      self.label = setPropertyValue(jsonObject.label, '');
      self.recipients = setPropertyValue(jsonObject.recipients, []);
      self.owner = setPropertyValue(jsonObject.owner, []);
      self.toDTO = toDTO;
      self.getOwnerNameOrEmail = getOwnerNameOrEmail;
      self.uuid = setPropertyValue(jsonObject.uuid, null);
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
        allowedToActivation.original = clonedData.value;
        allowedToActivation.value = (_.isUndefined(clonedData.value) || _.isUndefined(clonedData.unit)) ? undefined : moment()
          .add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_EXPIRATION').then(function(data) {
        var clonedData = _.cloneDeep(data || {});

        allowedToExpiration = clonedData;
        allowedToExpiration.canOverride =
            _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
        allowedToExpiration.original = clonedData.value;
        allowedToExpiration.value = (_.isUndefined(clonedData.value) || _.isUndefined(clonedData.unit)) ? undefined : (allowedToActivation && allowedToActivation.value ? moment(allowedToActivation.value) : moment())
          .add(clonedData.value, clonedData.unit.toLowerCase()).toDate();
      }),
      functionalityRestService.getFunctionalityParams('UPLOAD_REQUEST__DELAY_BEFORE_NOTIFICATION').then(function(data) {
        var clonedData = _.cloneDeep(data || {});

        allowedToExpiryNotification = clonedData;
        allowedToExpiryNotification.canOverride =
          _.isUndefined(clonedData.canOverride) ? false : clonedData.canOverride;
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
     *  @name toDTO
     *  @desc Build a guest DTO object from the curent guest object
     *  @returns {Object} Return a guest DTO object
     *  @memberOf LinShare.guests.GuestObjectService
     */
  function toDTO() {
    self = this;
    const dto = {};

    dto.activationDate = self.activationDate && moment(self.activationDate).valueOf();
    dto.expiryDate = self.expirationDate && moment(self.expirationDate).valueOf();
    dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf();
    dto.label = self.label;
    dto.body = self.body;
    dto.maxFileCount = self.maxNumberOfFiles;
    dto.maxDepositSize = unitService.toByte(self.totalSizeOfFiles.value, unitService.formatUnit(self.totalSizeOfFiles.unit));
    dto.maxFileSize = unitService.toByte(self.maxSizeOfAFile.value, unitService.formatUnit(self.maxSizeOfAFile.unit));
    dto.canDelete = self.allowDeletion;
    dto.canClose = self.allowClosure;
    dto.secured = self.passwordProtected;
    dto.enableNotification = true;
    dto.dirty = true;
    dto.locale = self.notificationLanguage;

    return dto;
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
  
  function getOwnerNameOrEmail() {
    if (self.owner.firstName && self.owner.lastName) {
      return `${self.owner.firstName}  ${self.owner.lastName}`;
    }

    return self.owner.mail;
  };
}
