angular
  .module('linshare.uploadRequests')
  .factory('UploadRequestObjectService', UploadRequestObjectService);

UploadRequestObjectService.$inject = [
  '_',
  'moment',
  'unitService',
  'uploadRequestRestService',
  'UploadRequestObjectCoreService'
];

function UploadRequestObjectService(
  _,
  moment,
  unitService,
  uploadRequestRestService,
  UploadRequestObjectCoreService
) {
  let self;

  return UploadRequestObject;

  ////////////

  function UploadRequestObject(jsonObject = {}) {
    self = this;

    UploadRequestObjectCoreService.call(self, jsonObject);

    self.submitting = false;
    self.toDTO = toDTO;
    self.update = update;
  }

  /**
   *  @name toDTO
   *  @desc Build a DTO object from the curent object
   *  @returns {Object} Return a guest DTO object
   */
  function toDTO() {
    self = this;
    const dto = {};

    dto.activationDate = self.activationDate && moment(self.activationDate).valueOf() || undefined;
    dto.expiryDate = self.expiryDate && moment(self.expiryDate).valueOf() || undefined;
    dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf() || undefined;
    dto.maxFileCount = self.maxFileCount;
    dto.maxDepositSize = unitService.toByte(self.totalSizeOfFiles.value, unitService.formatUnit(self.totalSizeOfFiles.unit));
    dto.maxFileSize = unitService.toByte(self.maxSizeOfAFile.value, unitService.formatUnit(self.maxSizeOfAFile.unit));
    dto.canDeleteDocument = self.canDeleteDocument;
    dto.canClose = self.canClose;
    dto.enableNotification = true;
    dto.locale = self.locale;

    return dto;
  }

  function update() {
    self = this;
    self.submitting = true;

    return uploadRequestRestService.update(self.uuid, self.toDTO())
      .then(data => {
        self.submitting = false;

        return data;
      })
      .catch(error => {
        self.submitting = false;

        throw error;
      });;
  }
}
