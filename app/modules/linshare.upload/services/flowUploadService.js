/**
 * flowUploadService Service
 * @namespace flowUploadService
 * @memberOf LinShare.upload
 */
(function() {
  'use strict';

  angular
    .module('linshare.upload')
    .factory('flowUploadService', flowUploadService);

  flowUploadService.$inject = ['_', '$filter', '$log', '$q', '$timeout', '$translatePartialLoader',
    'authenticationRestService', 'LinshareDocumentRestService', 'lsAppConfig', 'uploadRestService',
    'workgroupNodesRestService'];

  /**
   * @namespace flowUploadService
   * @desc Upload system service
   * @memberOf LinShare.upload
   */
  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false */
  function flowUploadService(_, $filter, $log, $q, $timeout, $translatePartialLoader,
                             authenticationRestService, LinshareDocumentRestService, lsAppConfig,
                             uploadRestService, workgroupNodesRestService) {

    const
      NONE = 'NONE',
      RETRIABLE_ERROR_CASES = [NONE, 39001, 40403, 40404, 46011, 46012, 46013, 46014],
      STATUS_FAILED = 'FAILED',
      STATUS_SUCCESS = 'SUCCESS';

    var
      error46010,
      error46014,
      errorNone,
      messagePrefix = 'SERVER_RESPONSE.DETAILS.UPLOAD_ERROR.',
      service = {
        addUploadedFile: addUploadedFile,
        checkAsyncUploadDetails: checkAsyncUploadDetails,
        checkQuotas: checkQuotas,
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
        var logMessage = null;
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
            var hasCustomMessage = false;
            var errorCode = NONE;
            var errorMessage = errorNone;
            if (flowFile.asyncUploadDetails) {
              errorCode = flowFile.asyncUploadDetails.errorCode;
              if (errorCode === 46010) {
                errorMessage = customErrorMessage(error46010, '${maxFileSize}', flowFile.quotas.maxFileSize);
                hasCustomMessage = true;
              } else if (errorCode === 46014) {
                errorMessage = customErrorMessage(error46014, '${quotaAttempt}', flowFile.quotas.quota);
                hasCustomMessage = true;
              } else {
                errorMessage = messagePrefix + errorCode;
              }
            }

            onErrorAction(flowFile, errorCode, errorMessage, hasCustomMessage).then(function(data) {
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
      // TODO IAB : translate better in improvement (with directive translate and translate-values)
      error46010 = $filter('translate')(messagePrefix + 46010);
      error46014 = $filter('translate')(messagePrefix + 46014);
      authenticationRestService.getCurrentUser().then(function(user) {
        uploadRestService.getQuota(user.quotaUuid).then(function(quotas) {
          $log.debug('Getting quotas - ', quotas.plain());
          updateQuotas(quotas.plain());

          _.forEach(flowFiles, function(flowFile) {
            flowFile.quotas = quotas.plain();
            flowFile.asyncUploadDeferred = $q.defer();

            var errorCode = NONE;
            var errorMessage = null;
            var hasCustomMessage = false;

            if (quotas.maintenance && onError) {
              errorMessage = messagePrefix + NONE;
            } else if (flowFile.size > quotas.maxFileSize) {
              errorCode = 46010;
              errorMessage = customErrorMessage(error46010, '${maxFileSize}', quotas.maxFileSize);
              hasCustomMessage = true;
            } else if ((quotas.quota - quotas.usedSpace) <= flowFile.size) {
              errorCode = 46014;
              errorMessage = customErrorMessage(error46014, '${quotaAttempt}', quotas.quota);
              hasCustomMessage = true;
            }

            if (errorMessage) {
              onErrorAction(flowFile, errorCode, errorMessage, hasCustomMessage);
            } else if (flowFile.error && flowFile.canBeRetried) {
              onRetryAction(flowFile);
            }

            flowFile.quotaChecked = true;
            quotas.usedSpace += flowFile.size;
          });
        }, function(err) {
          $log.debug('Getting quotas error - ', err);
        });
      });
    }

    /**
     * @namespace customErrorMessage
     * @desc Make a custom string for errorMessage with a byte value to convert
     * @param {string} errorMessageSource - Error message translated previously
     * @param {string} stringToReplace - String to replace in errorMessageSource (e.q. ${myString})
     * @param {string} stringReplace - New string to apply (here a file size in byte)
     * @returns {string} Custom string
     * @memberOf LinShare.upload.flowUploadService
     */
    function customErrorMessage(errorMessageSource, stringToReplace, stringReplace) {
      return (_.clone(errorMessageSource)).replace(stringToReplace, $filter('readableSize')(stringReplace, true));
    }

    /**
     * @namespace initFlowUploadService
     * @desc activation function of the controller launch at every instantiation
     * @memberOf LinShare.upload.flowUploadService
     */
    function initFlowUploadService() {
      $translatePartialLoader.addPart('serverResponse');
      errorNone = messagePrefix + NONE;
    }

    /**
     * @namespace onErrorAction
     * @desc Action launched if file get an error
     * @param {Object} flowFile - File uploaded
     * @param {number} errorCode - Error code to show on file upload information (in upload queue and upload popup)
     * @param {string} errorMessage - Message to show on file upload information (in upload queue and upload popup)
     * @param {Boolean} hasCustomMessage - Defined if message is custom
     * @returns {promise} Promise with flowFile uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function onErrorAction(flowFile, errorCode, errorMessage, hasCustomMessage) {
      flowFile.pause();
      flowFile.errorCode = errorCode !== NONE ? errorCode : null;
      flowFile.errorMessage = errorMessage;
      flowFile.hasCustomMessage = hasCustomMessage;
      flowFile.canBeRetried = _.includes(RETRIABLE_ERROR_CASES, errorCode);
      flowFile.error = true;
      $timeout(function() {
        flowFile.errorAgain = true;
      }, 200);
      flowFile.asyncUploadDeferred.reject(flowFile);
      return flowFile.asyncUploadDeferred.promise;
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
      delete flowFile.hasCustomMessage;
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
        file._from = from;
        if (from === lsAppConfig.workgroupPage) {
          file.folderDetails = folderDetails;
        }
      });
      flowFiles[0].flowObj.upload();
    }
  }
})();
