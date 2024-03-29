angular
  .module('linshare.uploadRequests')
  .factory('UploadRequestGroupObjectService', UploadRequestGroupObjectService);

UploadRequestGroupObjectService.$inject = [
  '_',
  'uploadRequestGroupRestService',
  'moment',
  '$log',
  'unitService',
  'toastService',
  'uploadRequestUtilsService',
  'UploadRequestObjectCoreService'
];

/**
 *  @namespace UploadRequestGroupObjectService
 *  @desc Manipulation of uploadRequest object front/back
 *  @memberOf LinShare.uploadRequest
 */
function UploadRequestGroupObjectService(
  _,
  uploadRequestGroupRestService,
  moment,
  $log,
  unitService,
  toastService,
  uploadRequestUtilsService,
  UploadRequestObjectCoreService
) {
  const { showToastAlertFor, openWarningDialogFor } = uploadRequestUtilsService;
  var self;

  return uploadRequestGroupObject;

  /**
   *  @name uploadRequestGroupObject
   *  @desc Constructor of the uploadRequest object
   *  @param {Object} jsonObject - Json object for constructing a uploadRequest object
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function uploadRequestGroupObject(jsonObject = {}, options = {}) {
    self = this;

    UploadRequestObjectCoreService.call(self, jsonObject);

    self.create = create;
    self.update = update;
    self.toDTO = toDTO;
    self.toUpdateDTO = toUpdateDTO;

    self.newRecipients = [];
    self.addRecipient = addRecipient;
    self.removeRecipient = removeRecipient;
    self.removeNewRecipient = removeNewRecipient;
    self.getRecipients = getRecipients;
    self.getNewRecipients = getNewRecipients;
    self.submitRecipients = submitRecipients;
    self.submitRecipientsCallback = options.submitRecipientsCallback;
    self.submitting = false;
  }

  /**
   *  @name create
   *  @desc Create the instatiated object by the API
   *  @returns {Object} result promise
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function create() {
    self = this;
    self.submitting = true;

    return uploadRequestGroupRestService.create(self.toDTO(), { collective: self.collective })
      .then(data => {
        self.submitting = false;

        return data;
      })
      .catch(error => {
        self.submitting = false;

        throw error;
      });
  }

  /**
   *  @name update
   *  @desc Update the instatiated object by the API
   *  @returns {Object} result promise
   *  @memberOf LinShare.uploadRequests.UploadRequestGroupObjectService
   */
  function update() {
    self = this;
    self.submitting = true;

    return uploadRequestGroupRestService.update(self.uuid, self.toUpdateDTO())
      .then(data => {
        self.submitting = false;

        return data;
      })
      .catch(error => {
        self.submitting = false;

        throw error;
      });;
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

    dto.activationDate = self.activationDate && moment(self.activationDate).valueOf() || self.defaultActivationDate && moment(self.defaultActivationDate).valueOf() || undefined;
    dto.expiryDate = self.expiryDate && moment(self.expiryDate).valueOf() || undefined;
    dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf() || undefined;
    dto.label = self.label;
    dto.body = self.body;
    dto.contactList = self.newRecipients.map(recipient => recipient.mail);
    dto.maxFileCount = self.maxFileCount;
    dto.maxDepositSize = unitService.toByte(self.totalSizeOfFiles.value, self.totalSizeOfFiles.unit);
    dto.maxFileSize = unitService.toByte(self.maxSizeOfAFile.value, self.maxSizeOfAFile.unit);
    dto.canDelete = self.canDelete;
    dto.canClose = self.canClose;
    dto.protectedByPassword = self.protectedByPassword;
    dto.enableNotification = true;
    dto.locale = self.locale;

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

    dto.activationDate = self.activationDate && moment(self.activationDate).valueOf() || self.defaultActivationDate && moment(self.defaultActivationDate).valueOf() || undefined;
    dto.expiryDate = self.expiryDate && moment(self.expiryDate).valueOf() || undefined;
    dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf() || undefined;
    dto.label = self.label;
    dto.body = self.body;
    dto.maxFileCount = self.maxFileCount;
    dto.maxDepositSize = unitService.toByte(self.totalSizeOfFiles.value, self.totalSizeOfFiles.unit);
    dto.maxFileSize = unitService.toByte(self.maxSizeOfAFile.value, self.maxSizeOfAFile.unit);
    dto.canDelete = self.canDelete;
    dto.canClose = self.canClose;
    dto.enableNotification = true;
    dto.locale = self.locale;

    return dto;
  }

  function addRecipient() {
    const contact = this.selectedUser;
    const uniqueInitialRecipients = _.uniqBy(self.recipients, 'mail');
    let exists = false;

    if (contact && contact.type === 'simple') {
      contact.mail = contact.identifier;
    }

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
          showToastAlertFor('add_recipients', 'error', self.newRecipients);
        }
      });
  }
}
