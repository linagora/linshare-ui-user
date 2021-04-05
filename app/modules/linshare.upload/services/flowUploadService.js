/**
 * flowUploadService Service
 * @namespace flowUploadService
 * @memberOf LinShare.upload
 */
(function() {
  'use strict';

  angular
    .module('linshare.upload')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('serverResponse');
    }])
    .factory('flowUploadService', flowUploadService);

  flowUploadService.$inject = [
    '_',
    '$filter',
    '$log',
    '$q',
    '$timeout',
    'authenticationRestService',
    'flowFactory',
    'LinshareDocumentRestService',
    'lsAppConfig',
    'lsErrorCode',
    'uploadRestService',
    'workgroupNodesRestService',
    'sharedSpaceRestService'
  ];

  /**
   * @namespace flowUploadService
   * @desc Upload system service
   * @memberOf LinShare.upload
   */
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false */
  function flowUploadService(
    _,
    $filter,
    $log,
    $q,
    $timeout,
    authenticationRestService,
    flowFactory,
    LinshareDocumentRestService,
    lsAppConfig,
    lsErrorCode,
    uploadRestService,
    workgroupNodesRestService,
    sharedSpaceRestService
  ) {

    const
      NONE = 'NONE',
      STATUS_FAILED = 'FAILED',
      STATUS_SUCCESS = 'SUCCESS',
      UNRETRIABLE_ERROR_CASES = [
        lsErrorCode.FILE_EMPTY,
        3000,
        3002,
        3003,
        46001,
        46002,
        46003,
        46004,
        46010
      ];

    var
      errorNone,
      messagePrefix = 'SERVER_RESPONSE.DETAILS.UPLOAD_ERROR.',
      userQuotaUuid,
      service = {
        addUploadedFile: addUploadedFile,
        checkAsyncUploadDetails: checkAsyncUploadDetails,
        checkQuotas: checkQuotas,
        errorHandler: errorHandler,
        initFlowUploadService: initFlowUploadService,
        uploadFiles: uploadFiles
      };

    return service;

    ////////////////

    /**
     * @namespace addUploadedFile
     * @desc Once upload is finished, check if file is in error and launch error flow,
     * or launch asyncUploadDetails function
     * @param {Object} flowFile - File uploaded
     * @param {Object} serverResponse - Response from the server
     * @returns {promise} Promise with flowFile uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function addUploadedFile(flowFile, serverResponse) {
      flowFile.asyncUploadDeferred = $q.defer();

      var response = serverResponse.length > 0 ? angular.fromJson(serverResponse) : undefined;
      var noResponse = _.isUndefined(response);

      if (noResponse || !response.chunkUploadSuccess) {
        var logMessage = flowFile.asyncUploadDetails.errorMsg;
        var errorCode = NONE;
        var errorMessage = errorNone;

        if (!noResponse) {
          logMessage = response.errorMessage;
          errorCode = response.errorCode;
          errorMessage = messagePrefix + errorCode;
        }

        $log.error('Error occurred while uploading file : ' + flowFile.name + ' - ' + logMessage);
        onErrorAction(flowFile, errorCode, errorMessage, false).catch(function(file) {
          flowFile.asyncUploadDeferred.reject(file);
        });
      } else {
        flowFile.asyncTaskUuid = response.asyncTaskUuid;
        timerGetAsyncUploadDetails(flowFile).then(function(file) {
          flowFile.asyncUploadDeferred.resolve(file);
        }).catch(function(file) {
          flowFile.asyncUploadDeferred.reject(file);
        });
      }

      return flowFile.asyncUploadDeferred.promise;
    }

    /**
     * @namespace isRetryable
     * @desc Determine if the file can be set as retryable
     * @param {number} errorCode - Error code return by the server
     * @memberOf LinShare.upload.flowUploadService
     */
    function isRetryable(errorCode) {
      return !_.includes(UNRETRIABLE_ERROR_CASES, errorCode);
    }

    /**
     * @namespace checkAsyncUploadDetails
     * @desc Check async upload details of the uploaded file, loop it while the server treatment is not finished
     * @param {Object} flowFile - File uploaded
     * @returns {promise} Timer to get Async Upload details, or Promise with flowFile uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function checkAsyncUploadDetails(flowFile) {
      uploadRestService.getAsyncUploadDetails(flowFile.asyncTaskUuid).then(function(asyncUploadDetails) {
        flowFile.asyncUploadDetails = asyncUploadDetails.plain();
        if (flowFile.asyncUploadDetails.status === STATUS_SUCCESS ||
          flowFile.asyncUploadDetails.status === STATUS_FAILED) {
          delete flowFile.doingAsyncUpload;
          if (flowFile.asyncUploadDetails.status === STATUS_SUCCESS) {
            onSuccessAction(flowFile).then(function(data) {
              flowFile.asyncUploadDeferred.resolve(data);
            });
          } else {
            var errorParams = {};
            var errorCode = NONE;
            var errorMessage = errorNone;

            if (flowFile.asyncUploadDetails) {
              flowFile.asyncUploadDetails.errorCode = flowFile.asyncUploadDetails.errorCode === -1 ?
                NONE : flowFile.asyncUploadDetails.errorCode;
              errorCode = flowFile.asyncUploadDetails.errorCode;
              errorMessage = messagePrefix + errorCode;
              if (errorCode === 46010) {
                errorParams = {maxFileSize: $filter('readableSize')(flowFile.quotas.maxFileSize, true)};
              } else if (errorCode === 46014) {
                errorParams = {quotaAttempt: $filter('readableSize')(flowFile.quotas.quota, true)};
              }
            }

            onErrorAction(flowFile, errorCode, errorMessage, errorParams).then(function(data) {
              flowFile.asyncUploadDeferred.reject(data);
            });
          }
        } else {
          return timerGetAsyncUploadDetails(flowFile);
        }
      });

      return flowFile.asyncUploadDeferred.promise;
    }

    /**
     * @namespace checkQuotas
     * @desc Check quotas of each uploaded files, before launching their upload
     * @param {Array<Object>} flowFiles - List of files to upload
     * @param {Boolean} onError - Check if the function is called on start/retry upload, or on error
     * @param {function} updateQuotas - Update user's quotas in left sidebar bottom
     * @memberOf LinShare.upload.flowUploadService
     */
    function checkQuotas(flowFiles, onError, updateQuotas) {
      _.forEach(flowFiles, function(flowFile) {
        var fromMySpace = _.isUndefined(flowFile.folderDetails);
        var quotasToCheck = fromMySpace ? uploadRestService.getQuota(userQuotaUuid) :
          sharedSpaceRestService.getQuota(flowFile.folderDetails.quotaUuid);

        quotasToCheck.then(function(quotas) {
          flowFile.quotas = quotas.plain();
          flowFile.asyncUploadDeferred = $q.defer();

          if (fromMySpace) {
            updateQuotas(quotas.plain());
          }

          var errorCode = NONE;
          var errorMessage = null;
          var errorParams = {};

          if (quotas.maintenance && onError) {
            errorMessage = messagePrefix + NONE;
          } else if (flowFile.size > quotas.maxFileSize) {
            errorCode = 46010;
            errorMessage = messagePrefix + errorCode;
            errorParams = {maxFileSize: $filter('readableSize')(flowFile.quotas.maxFileSize, true)};
          } else if ((quotas.quota - quotas.usedSpace) <= flowFile.size) {
            errorCode = 46014;
            errorMessage = messagePrefix + errorCode;
            errorParams = {quotaAttempt: $filter('readableSize')(flowFile.quotas.quota, true)};
          }

          if (errorMessage) {
            onErrorAction(flowFile, errorCode, errorMessage, errorParams);
          } else if (flowFile.error && flowFile.canBeRetried) {
            onRetryAction(flowFile);
          }

          flowFile.quotaChecked = true;
          quotas.usedSpace += flowFile.size;
        }).catch(function(err) {
          $log.debug('Getting quotas error - ', err);
        });
      });
    }

    /**
     * @namespace errorHandler
     * @desc Flow file error handler
     * @memberOf LinShare.upload.flowUploadService
     */
    function errorHandler(flowFile, flowChunk) {
      flowFile.canBeRetried = isRetryable(flowChunk.xhr.data ? flowChunk.xhr.data.errorCode : flowChunk.xhr.status);
      flowFile.asyncUploadDeferred.reject(flowFile);
    }

    /**
     * @namespace initFlowUploadService
     * @desc activation function of the controller launch at every instantiation
     * @memberOf LinShare.upload.flowUploadService
     */
    function initFlowUploadService() {
      errorNone = messagePrefix + NONE;

      if (!service.flowObj) {
        service.flowObj = flowFactory.create();
      } else {
        if (service.flowObj.files.length > 0) {
          service.flowObj.upload();
        }
      }

      if (!userQuotaUuid) {
        authenticationRestService.getCurrentUser().then(function(user) {
          userQuotaUuid = user.quotaUuid;
        }).catch(function(error) {
          $log.debug(error);
        });
      }
    }

    /**
     * @namespace onErrorAction
     * @desc Action launched if file get an error
     * @param {Object} flowFile - File uploaded
     * @param {number} errorCode - Error code to show on file upload information (in upload queue and upload popup)
     * @param {string} errorMessage - Message to show on file upload information (in upload queue and upload popup)
     * @param {Object} errorParams - Parameters for translation values
     * @returns {promise} Promise with flowFile uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function onErrorAction(flowFile, errorCode, errorMessage, errorParams) {
      flowFile.pause();
      flowFile.errorCode = errorCode !== NONE ? errorCode : null;
      flowFile.errorMessage = errorMessage;
      flowFile.errorParams = errorParams;
      flowFile.canBeRetried = isRetryable(errorCode);
      flowFile.error = true;
      $timeout(function() {
        flowFile.errorAgain = true;
      }, 200);

      return $q
        .when(flowFile.asyncUploadDeferred)
        .then(function(defer) {
          if (defer) {
            defer.reject(flowFile);

            return defer.promise;
          }

          return $q.reject(flowFile);
        });
    }

    /**
     * @namespace onRetryAction
     * @desc Action launched if file get an error and user retried to upload it
     * @param {Object} flowFile - File uploaded
     * @returns {promise} Promise with flowFile uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function onRetryAction(flowFile) {
      flowFile.retry();
      flowFile.resume();
      delete flowFile.errorCode;
      delete flowFile.errorMessage;
      delete flowFile.errorParams;
      delete flowFile.canBeRetried;
      delete flowFile.doingAsyncUpload;
      flowFile.error = false;
      flowFile.errorAgain = false;
      $log.debug('Error during upload, need to retry file : ', flowFile.name);
      flowFile.asyncUploadDeferred.reject(flowFile);

      return flowFile.asyncUploadDeferred.promise;
    }

    /**
     * @namespace onSuccessAction
     * @desc Action launched if file is uploaded successfully
     * @param {Object} flowFile - File uploaded
     * @returns {promise} Promise with flowFile uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function onSuccessAction(flowFile) {
      var fileDetailsRequest = (flowFile._from === lsAppConfig.mySpacePage) ?
        LinshareDocumentRestService.get(flowFile.asyncUploadDetails.resourceUuid) :
        workgroupNodesRestService.get(flowFile.folderDetails.workgroupUuid, flowFile.asyncUploadDetails.resourceUuid);

      fileDetailsRequest.then(function(document) {
        flowFile.linshareDocument = document;
        flowFile.asyncUploadDeferred.resolve(flowFile);
      });

      return flowFile.asyncUploadDeferred.promise;
    }

    /**
     * @namespace timerGetAsyncUploadDetails
     * @desc Timer launched during server treatment for uploading file
     * @param {Object} flowFile - File uploaded
     * @returns {promise} Promise with flowFile uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function timerGetAsyncUploadDetails(flowFile) {
      var delay = lsAppConfig.asyncUploadDelay;

      if (!_.isUndefined(flowFile.asyncUploadDetails)) {
        delay = flowFile.asyncUploadDetails.frequency ? flowFile.asyncUploadDetails.frequency : delay;
      }
      $timeout(function() {
        $log.debug('Asking server async', flowFile);
        checkAsyncUploadDetails(flowFile).then(function(file) {
          flowFile.asyncUploadDeferred.resolve(file);
        }).catch(function(file) {
          flowFile.asyncUploadDeferred.reject(file);
        });
      }, delay);

      return flowFile.asyncUploadDeferred.promise;
    }

    /**
     * @namespace uploadFiles
     * @desc Upload system service
     * @param {Array<Object>} flowFiles - List of files to upload
     * @param {string} from - Destination of upload
     * @param {string} folderDetails - Folder details (only defined if destination is workgroup)
     * @memberOf LinShare.upload.flowUploadService
     */
    function uploadFiles(flowFiles, from, folderDetails) {
      _.forEach(flowFiles, function(file) {
        if (!file.size) {
          var errorCode = lsErrorCode.FILE_EMPTY;
          var errorMessage = messagePrefix + errorCode;

          onErrorAction(file, errorCode, errorMessage);

          return;
        }

        file._from = from;
        if (from === lsAppConfig.workgroupPage) {
          file.folderDetails = folderDetails;
        }
      });
      flowFiles[0].flowObj.upload();
    }
  }
})();
