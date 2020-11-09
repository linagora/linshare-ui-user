angular
  .module('linshare.uploadRequests')
  .factory('UploadRequestObjectService', UploadRequestObjectService);

UploadRequestObjectService.$inject = [
  '_', '$q', 'functionalityRestService', 'uploadRequestGroupRestService', 'moment', '$log'
];

/**
 *  @namespace UploadRequestObjectService
 *  @desc Manipulation of uploadRequest object front/back
 *  @memberOf LinShare.uploadRequest
 */
function UploadRequestObjectService(_, $q, functionalityRestService, uploadRequestGroupRestService, moment, $log) {

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

  UploadRequestObjectService.$inject = [
    '_',
    '$q',
    'functionalityRestService',
    'uploadRequestGroupRestService',
    'moment',
    '$log',
    'toastService',
    'uploadRequestUtilsService'
  ];

  /**
   *  @name checkFunctionalities
   *  @desc Check the different rights relative to the uploadRequest
   *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
   */
  function UploadRequestObjectService(
    _,
    $q,
    functionalityRestService,
    uploadRequestGroupRestService,
    moment,
    $log,
    toastService,
    uploadRequestUtilsService
  ) {

    const { showToastAlertFor, openWarningDialogFor } = uploadRequestUtilsService;

    /**
     *  @name create
     *  @desc Create the instatiated object by the API
     *  @returns {Object} result promise
     *  @memberOf LinShare.uploadRequests.UploadRequestObjectService
     */
    function create() {
      self = this;
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
      function UploadRequestObject(jsonObject, options = {}) {
        self = this;
        jsonObject = jsonObject || {};
        checkFunctionalities().then(function () {
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
          self.label = setPropertyValue(jsonObject.label, '');
          self.groupMode = setPropertyValue(jsonObject.groupMode, false);
          self.message = setPropertyValue(jsonObject.message, '');
          self.recipients = setPropertyValue(jsonObject.recipients, []);
          self.newRecipients = [];
          self.mailingListUuid = setPropertyValue(jsonObject.mailingListUuid, []);
          self.mailingList = setPropertyValue(jsonObject.mailingList, []);
          self.modificationDate = setPropertyValue(jsonObject.modificationDate, '');
          self.reset = reset;
          self.update = update;
          self.toDTO = toDTO;
          self.addRecipient = addRecipient;
          self.removeRecipient = removeRecipient;
          self.removeNewRecipient = removeNewRecipient;
          self.getRecipients = getRecipients;
          self.getNewRecipients = getNewRecipients;
          self.getMailingListUuid = getMailingListUuid;
          self.getMailingList = getMailingList;
          self.removeMailingList = removeMailingList;
          self.getMaxDateOfExpiration = getMaxDateOfExpiration;
          self.getMinDateOfActivation = getMinDateOfActivation;
          self.getMaxSize = getMaxSize;
          self.getMaxDateOfNotification = getMaxDateOfNotification;
          self.calculateDatePickerOptions = calculateDatePickerOptions;
          self.uuid = setPropertyValue(jsonObject.uuid, undefined);
          self.submitRecipients = submitRecipients;
          self.submitRecipientsCallback = options.submitRecipientsCallback;
          calculateDatePickerOptions();
          setFormValue().then(function (formData) {
            self.form = formData;
            if (!_.isUndefined(self.uuid)) {
              // TODO: Handle for update
            }
          });
        });
      }

      uploadRequestGroupRestService.create(uploadRequestDTO, { groupMode: self.groupMode }).then(data => {
        deferred.resolve(data);
      }).catch(error => {
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

      dto.activationDate = self.activationDate && moment(self.activationDate).valueOf();
      dto.expiryDate = self.expirationDate && moment(self.expirationDate).valueOf();
      dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf();
      dto.label = self.mail;
      dto.body = self.message;
      dto.contactList = self.newRecipients.map(recipient => recipient.mail);
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
      self = this;
      var
        deferred = $q.defer(),
        uploadRequestDTO = self;

      uploadRequestGroupRestService.update(uploadRequestDTO.uuid, uploadRequestDTO).then(data => {
        deferred.resolve(data);
      }).catch(error => {
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
              break;
            }
        case 'user':
          const uniqueInitialRecipients = _.uniqBy(self.recipients, 'mail');

          uniqueInitialRecipients.forEach(initialRecipient => {
            if (initialRecipient.mail === contact.mail) {
              exists = true;
              toastService.error({ key: 'TOAST_ALERT.WARNING.EMAIL_ALREADY_IN_UPLOAD_REQUEST' });
              $log.info('The user ' + contact.mail + ' is already in the upload request');
            }
          });

          angular.forEach(self.recipients, function (elem) {
            if (elem.mail === contact.mail && elem.domain === contact.domain) {
              exists = true;
              $log.info('The user ' + contact.mail + ' is already in the recipients list');
            }
          });
          if (!exists) {
            const { firstName, lastName, mail } = contact;

            self.newRecipients.push({ firstName, lastName, mail });
          }
      });
      if (!exists) {
        self.recipients.push(_.omit(contact, 'restrictedContacts', 'type', 'display', 'identifier'));
      }
      break;
      case 'mailinglist':
      _.forEach(self.mailingListUuid, function (element) {
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

  function removeNewRecipient(index) {
    self.newRecipients.splice(index, 1);
  };

  function getRecipients() {
    return self.recipients;
  };

  function getNewRecipients() {
    return self.newRecipients;
  }

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
    const minDate = !_.isUndefined(self.allowedToActivation.maxValue) && self.allowedToActivation.unit
      ? moment().add(self.allowedToActivation.maxValue, self.allowedToActivation.unit.toLowerCase())
      : moment();

    if (!isFormatted) {
      return minDate.toDate();
    }

    return minDate.format('DD MMM YYYY');
  }

  function getMaxDateOfNotification(isFormatted) {
    const expirationDate = self.expirationDate && moment(self.expirationDate);
    const maxDate = !_.isUndefined(self.allowedToExpiryNotification.maxValue)
      && self.allowedToExpiryNotification.unit
      && expirationDate
      && expirationDate.subtract(self.allowedToExpiryNotification.maxValue, self.allowedToExpiryNotification.unit.toLowerCase());

    if (!isFormatted) {
      return maxDate && maxDate.toDate();
    }

    return maxDate && maxDate.format('DD MMM YYYY');
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

    const maxValue = configMaxValue * convertBase(currentUnit, configUnit);

    if (isFormatted) {
      return `${maxValue} ${formatUnit(configUnit)}`;
    } else {
      return maxValue;
    }
  }

  function submitRecipients() {
    if (self.getNewRecipients().length === 0) {
      toastService.error({ key: 'TOAST_ALERT.WARNING.AT_LEAST_ONE_RECIPIENT_UPLOAD_REQUEST' });

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

  // Helper
  function convertToByte(obj) {
    const sizes = ['Bytes', 'KILO', 'MEGA', 'GIGA'];
    const indexInSizes = sizes.indexOf(obj.unit);
    const base = 1024;

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

    function convertBase(currentUnit, configUnit) {
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
  };
