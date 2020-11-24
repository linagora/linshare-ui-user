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

    dto.activationDate = self.activationDate && moment(self.activationDate).valueOf() || null;
    dto.expiryDate = self.expiryDate && moment(self.expiryDate).valueOf() || null;
    dto.notificationDate = self.notificationDate && moment(self.notificationDate).valueOf() || null;
    dto.maxFileCount = self.maxFileCount;
    dto.maxDepositSize = unitService.toByte(self.totalSizeOfFiles.value, unitService.formatUnit(self.totalSizeOfFiles.unit));
    dto.maxFileSize = unitService.toByte(self.maxSizeOfAFile.value, unitService.formatUnit(self.maxSizeOfAFile.unit));
    dto.canDeleteDocument = self.canDeleteDocument;
    dto.canClose = self.canClose;
    dto.enableNotification = true;
    dto.dirty = true;
    dto.locale = self.locale;

    return dto;
  }

  function update() {
    self = this;

    return uploadRequestRestService.update(self.uuid, self.toDTO());
  }
}
