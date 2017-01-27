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

  flowUploadService.$inject = ['$filter', '$log', '$q', '$timeout', '$translate', '$translatePartialLoader',
    'authenticationRestService', 'LinshareDocumentRestService', 'lsAppConfig', 'uploadRestService',
    'workgroupEntriesRestService'];

  /**
   * @namespace flowUploadService
   * @desc Upload system service
   * @memberOf LinShare.upload
   */
  function flowUploadService($filter, $log, $q, $timeout, $translate, $translatePartialLoader,
                             authenticationRestService, LinshareDocumentRestService, lsAppConfig,
                             uploadRestService, workgroupEntriesRestService) {

    const
      STATUS_FAILED = 'FAILED',
      STATUS_SUCCESS = 'SUCCESS';

    var
      error39001,
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
     * @desc Add upload source's folder details to all files to upload
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
        var logMessage = !noResponse ? response.errorMessage : null;
        $log.error('Error occurred while uploading file : ' + flowFile.name + ' - ' + logMessage);
        onErrorAction(flowFile, errorNone, !noResponse).catch(function(file) {
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
     * @desc Add upload source's folder details to all files to upload
     * @param {Object} flowFile - File uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function checkAsyncUploadDetails(flowFile) {
      uploadRestService.getAsyncUploadDetails(flowFile.asyncTaskUuid).then(function(asyncUploadDetails) {
        flowFile.asyncUploadDetails = asyncUploadDetails.plain();
        if (flowFile.asyncUploadDetails.status === STATUS_SUCCESS || flowFile.asyncUploadDetails.status === STATUS_FAILED) {
          delete flowFile.doingAsyncUpload;
          if (flowFile.asyncUploadDetails.status === STATUS_SUCCESS) {
            onSuccessAction(flowFile).then(function(data) {
              flowFile.asyncUploadDeferred.resolve(data);
            });
          } else {
            onErrorAction(flowFile, errorNone, false).then(function(data) {
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
     * @desc Add upload source's folder details to all files to upload
     * @param {Array<Object>} flowFiles - List of files to upload
     * @param {Boolean} onError - Check if the function is called on start/retry upload, or on error
     * @memberOf LinShare.upload.flowUploadService
     */
    function checkQuotas(flowFiles, onError) {
      authenticationRestService.getCurrentUser().then(function(user) {
        uploadRestService.getQuota(user.quotaUuid).then(function(quotas) {
          $log.debug('Getting quotas - ', quotas.plain());
          _.forEach(flowFiles, function(flowFile) {
            flowFile.asyncUploadDeferred = $q.defer();

            var errorMessage = null;
            var canBeRetried = false;

            if (quotas.maintenance && onError) {
              errorMessage = error39001;
              canBeRetried = true;
            } else if (flowFile.size > quotas.maxFileSize) {
              errorMessage = customErrorMessage(error46010, '${maxFileSize}', quotas.maxFileSize);
            } else if ((quotas.quota - quotas.usedSpace) <= flowFile.size) {
              errorMessage = customErrorMessage(error46014, '${quotaAttempt}', quotas.quota);
              canBeRetried = true;
            }

            if (errorMessage) {
              onErrorAction(flowFile, errorMessage, canBeRetried, true);
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
      return (_.clone(errorMessageSource)).replace(stringToReplace, $filter('readableSize')(stringReplace));
    }

    /**
     * @namespace initFlowUploadService
     * @desc activation function of the controller launch at every instantiation
     * @memberOf LinShare.upload.flowUploadService
     */
    function initFlowUploadService() {
      $translatePartialLoader.addPart('serverResponse');
      $translate.refresh().then(function() {
        $translate([
          messagePrefix + 39001,
          messagePrefix + 46010,
          messagePrefix + 46014,
          messagePrefix + 'NONE'
        ]).then(function(translations) {
          error39001 = translations[messagePrefix + 39001];
          error46010 = translations[messagePrefix + 46010];
          error46014 = translations[messagePrefix + 46014];
          errorNone = translations[messagePrefix + 'NONE'];
        });
      });
    }

    /**
     * @namespace onErrorAction
     * @desc Action launched if file get an error
     * @param {Object} flowFile - File uploaded
     * @param {string} errorMessage - Message to show on file upload information (in upload queue and upload popup)
     * @param {Boolean} canBeRetried - User can retry the upload of this file if true
     * @memberOf LinShare.upload.flowUploadService
     */
    function onErrorAction(flowFile, errorMessage, canBeRetried) {
      flowFile.pause();
      flowFile.errorMessage = errorMessage;
      flowFile.canBeRetried = canBeRetried;
      flowFile.error = true;
      flowFile.asyncUploadDeferred.reject(flowFile);
      return flowFile.asyncUploadDeferred.promise;
    }

    /**
     * @namespace onRetryAction
     * @desc Action launched if file get an error and user retried to upload it
     * @param {Object} flowFile - File uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function onRetryAction(flowFile) {
      flowFile.retry();
      flowFile.resume();
      delete flowFile.errorMessage;
      delete flowFile.canBeRetried;
      flowFile.error = false;
      $log.debug('Error during upload, need to retry file : ', flowFile.name);
      flowFile.asyncUploadDeferred.reject(flowFile);
      return flowFile.asyncUploadDeferred.promise;
    }

    /**
     * @namespace onSuccessAction
     * @desc Action launched if file is uploaded successfully
     * @param {Object} flowFile - File uploaded
     * @memberOf LinShare.upload.flowUploadService
     */
    function onSuccessAction(flowFile) {
      var fileDetailsRequest = (flowFile._from === lsAppConfig.mySpacePage) ?
        LinshareDocumentRestService.get(flowFile.asyncUploadDetails.resourceUuid) :
        workgroupEntriesRestService.get(flowFile.folderDetails.parent, flowFile.asyncUploadDetails.resourceUuid);
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
     * @memberOf LinShare.upload.flowUploadService
     */
    function timerGetAsyncUploadDetails(flowFile) {
      var delay = 2000;
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
    }
  }
})();
