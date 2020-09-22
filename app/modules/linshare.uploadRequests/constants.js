angular
  .module('linshare.uploadRequests')
  .constant('UPLOAD_REQUESTS_STATE_STATUS_MAPPING', {
    pending: 'CREATED',
    activeClosed: ['ENABLED', 'CLOSED'],
    archived: 'ARCHIVED'
  });
