(function() {
  'use strict';

  angular
    .module('linshare.document')
    .controller('documentController', documentController);

  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false, maxstatements: false */
  function documentController(_, $filter, $scope, LinshareDocumentRestService, $translate, $translatePartialLoader,
    $log, documentsList, $timeout, documentUtilsService, $q, flowUploadService, lsAppConfig, toastService, $stateParams,
    tableParamsService, auditDetailsService, swal, LinshareShareService) {

    var swalMultipleDownloadTitle, swalMultipleDownloadCancel, swalMultipleDownloadConfirm;

    $scope.addUploadedDocument = addUploadedDocument;
    $scope.backToSidebarContentDetails = backToSidebarContentDetails;
    $scope.closeDetailSidebar = closeDetailSidebar;
    $scope.closeSearch = closeSearch;
    $scope.currentDocument = {};
    $scope.currentPage = 'my_files';
    $scope.currentSelectedDocument = {
      current: ''
    };
    $scope.data = {
      selectedIndex: 0,
      bottom: false
    };
    $scope.deleteDocuments = deleteDocuments;
    $scope.documentsList = documentsList;
    $scope.documentUtilsService = documentUtilsService;
    $scope.downloadFile = downloadFile;
    $scope.downloadSelectedFiles = downloadSelectedFiles;
    $scope.flagsOnSelectedPages = {};
    $scope.flowUploadService = flowUploadService;
    $scope.getDetails = getDetails;
    $scope.getDocumentInfo = getDocumentInfo;
    $scope.loadSidebarContent = loadSidebarContent;
    $scope.lsAppConfig = lsAppConfig;
    $scope.lsFormat = lsFormat;
    $scope.lsFullDateFormat = lsFullDateFormat;
    $scope.multiDownload = multiDownload;
    $scope.mySpacePage = lsAppConfig.mySpacePage;
    $scope.nextTab = nextTab;
    $scope.onShare = onShare;
    $scope.openSearch = openSearch;
    $scope.paramFilter = {
      name: ''
    };
    $scope.previousTab = previousTab;
    $scope.recipientShareDetails = {
      current: ''
    };
    $scope.removeShare = removeShare;
    $scope.showCurrentFile = showCurrentFile;
    $scope.setTextInput = setTextInput;
    $scope.slideTextarea = slideTextarea;
    $scope.slideUpTextarea = slideUpTextarea;
    $scope.toggleSearchState = toggleSearchState;
    $scope.updateDocument = updateDocument;

    activate();

    ////////////////

    function activate() {
      $translatePartialLoader.addPart('filesList');
      $scope.fabButton = {
        toolbar: {
          activate: true,
          label: 'BOUTON_ADD_FILE_TITLE'
        },
        actions: [{
          action: 'documents.upload({from: lsAppConfig.mySpacePage, openSidebar: true})',
          label: 'ADD_FILES_DROPDOWN.UPLOAD_SHARE',
          icon: 'ls-share-file',
          flowBtn: true
        }, {
          action: null,
          label: 'ADD_FILES_DROPDOWN.UPLOAD_FILE',
          icon: 'ls-upload-fill',
          flowBtn: true
        }, {
          action: null,
          label: 'ADD_FILES_DROPDOWN.UPLOAD_IN_WORKGROUP',
          icon: 'ls-shared-space disabled-work-in-progress',
          disabled: true,
          hide: lsAppConfig.linshareModeProduction
        }]
      };

      // TODO : rename all GROWL
      $translate(['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE',
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CANCEL_BUTTON',
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'
        ])
        .then(function(translations) {
          swalMultipleDownloadTitle = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
          swalMultipleDownloadCancel = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CANCEL_BUTTON'];
          swalMultipleDownloadConfirm = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
        });

      $scope.$on('$stateChangeSuccess', function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });

      // TODO : delete that and use $scope.$watch(function() {return documentUtilsService.getReloadDocumentsList();}
      $scope.$on('linshare-share-done', function() {
        $scope.reloadDocuments();
      });

      $scope.$watch(function() {
        return documentUtilsService.getReloadDocumentsList();
      }, function(newValue) {
        if (newValue) {
          $scope.reloadDocuments();
          documentUtilsService.setReloadDocumentsList(false);
        }
      }, true);

      launchTableParamsInitiation();
    }

    function addUploadedDocument(flowFile) {
      if(flowFile._from === $scope.mySpacePage) {
        flowFile.asyncUploadDeferred.promise.then(function(file) {
          $scope.documentsList.push(file.linshareDocument);
          $scope.isNewAddition = tableParamsService.isItemAddedOnCurrentPage(file.linshareDocument.uuid);
          tableParamsService.reloadTableParams();
          $timeout(function() {
            $scope.isNewAddition = false;
          }, 0);
        });
      }
    }

    function backToSidebarContentDetails() {
      if ($scope.sidebarRightDataType === lsAppConfig.shareDetails) {
        $scope.loadSidebarContent(lsAppConfig.details);
      }
    }

    function closeDetailSidebar() {
      angular.element('#file-list-table tr li').removeClass('activeActionButton');
    }

    function closeSearch() {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }


    function deleteCallback(items) {
      var message;
      var nbItems = items.length;
      var responsesDeletion = [];
      $q.all(sortResponseDeletion(items, responsesDeletion)).then(function() {
        if (responsesDeletion.length > 0) {
          message = responsesDeletion.length === 1 ? {
            key: 'TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_SINGULAR'
          } : {
            key: 'TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_PLURAL',
            params: {
              number: responsesDeletion.length
            }
          };
          var responses = [];
          _.forEach(responsesDeletion, function(responseItems) {
            var currentResponse = {
              title: responseItems[0],
              message: {
                params: {
                  errCode: responseItems[1].data.errCode
                }
              }
            };
            switch(responseItems[1].status) {
              case 400:
              case 403:
              case 404:
                currentResponse.message.key = 'TOAST_ALERT.WARNING.ERROR_' + responseItems[1].status;
                break;
              default:
                currentResponse.message.key = 'TOAST_ALERT.WARNING.ERROR_500';
            }
            responses.push(currentResponse);
          });
          toastService.error(message, undefined, responses);
        } else {
          message = (nbItems === 1) ? 'GROWL_ALERT.ACTION.DELETE_SINGULAR' : 'GROWL_ALERT.ACTION.DELETE_PLURAL';
          toastService.success({key: message});
          $timeout(function() {
            $scope.getUserQuotas();
          }, 350);
        }
      });
    }

    function deleteDocuments(items) {
      documentUtilsService.deleteItem(items, documentUtilsService.itemUtilsConstant.DOCUMENT, deleteCallback);
    }

    /**
     * @name downloadFile
     * @desc Download the file
     * @param {Object} documentFile - A document object
     * @memberOf LinShare.document.documentController
     */
    function downloadFile(documentFile) {
      var url = LinshareDocumentRestService.download(documentFile.uuid);
      documentUtilsService.download(url, documentFile.name);
    }

    /**
     * @name downloadSelectedFiles
     * @desc Download selected files
     * @param {Array<Object>} selectedDocuments - List of selected files
     * @memberOf LinShare.document.documentController
     */
    function downloadSelectedFiles(selectedDocuments) {
      _.forEach(selectedDocuments, function(document) {
        $scope.downloadFile(document);
      });
    }

    function getDetails(item) {
      return $scope.showCurrentFile(item);
    }

    function getDocumentInfo(uuid) {
      LinshareDocumentRestService.get(uuid).then(function(data) {
        $scope.currentSelectedDocument.current.shares = data.shares;
      });
    }

    /**
     * @name launchTableParamsInitiation
     * @desc Initialize tableParams and related functions
     * @memberOf LinShare.document.documentController
     */
    function launchTableParamsInitiation() {
      var fileToSearch = $stateParams.fileUuid || $stateParams.uploadedFileUuid;
      tableParamsService.initTableParams($scope.documentsList, $scope.paramFilter, fileToSearch)
        .then(function(data) {
          $scope.tableParamsService = tableParamsService;
          $scope.tableParams = tableParamsService.getTableParams();
          $scope.lengthOfSelectedDocuments = tableParamsService.lengthOfSelectedDocuments;
          $scope.resetSelectedDocuments = tableParamsService.resetSelectedItems;
          $scope.selectedDocuments = tableParamsService.getSelectedItemsList();
          $scope.selectDocumentsOnCurrentPage = tableParamsService.tableSelectAll;
          $scope.addSelectedDocument = tableParamsService.toggleItemSelection;
          $scope.sortDropdownSetActive = tableParamsService.tableSort;
          $scope.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
          $scope.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
          $scope.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
          $scope.reloadDocuments = reloadDocuments;

        if ($stateParams.fileUuid) {
          if (_.isNil(data.itemToSelect)) {
            toastService.error({key: 'GROWL_ALERT.ERROR.FILE_NOT_FOUND'});
          } else {
            toastService.isolate({key: 'TOAST_ALERT.WARNING.ISOLATED_FILE'});
            $scope.addSelectedDocument(data.itemToSelect);
            $scope.toggleFilterBySelectedFiles();
            $scope.showCurrentFile(data.itemToSelect);
          }
        }
      });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} content The id of the content to load,
     *                 see app/views/includes/sidebar-right.html for possible values
     * @memberOf LinShare.document.documentController
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData($scope);
      $scope.mainVm.sidebar.setContent(content || lsAppConfig.share);
      $scope.mainVm.sidebar.show();
    }

    function lsFormat() {
      return $translate.use() === 'fr-FR' ? 'd MMMM y' : 'MMMM d y';
    }

    function lsFullDateFormat() {
      return $translate.use() === 'fr-FR' ? 'Le d MMMM y à  h:mm a' : 'The MMMM d  y at h:mma';
    }

    /**
     * @name multiDownload
     * @desc Prompt dialog to warn about multi download
     * @memberOf LinShare.document.documentController
     */
    function multiDownload() {
      $translate('SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT', {
        nbFiles: $scope.selectedDocuments.length,
        totalSize: $filter('readableSize')(_.sumBy($scope.selectedDocuments, 'size'), true)
      }).then(function(swalText) {
        swal({
            title: swalMultipleDownloadTitle,
            text: swalText,
            type: 'error',
            showCancelButton: true,
            confirmButtonText: swalMultipleDownloadConfirm,
            cancelButtonText: swalMultipleDownloadCancel,
            closeOnConfirm: true,
            closeOnCancel: true
          },
          function(isConfirm) {
            if (isConfirm) {
              downloadSelectedFiles($scope.selectedDocuments);
            }
          });
      });
    }

    function nextTab() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
    }

    function onShare(document) {
      $scope.loadSidebarContent();
      $timeout(function() {
        angular.element('#focusInputShare').trigger('focus');
      }, 350);
      if (document) {
        var index = $scope.selectedDocuments.indexOf(document);
        if (index === -1) {
          document.isSelected = true;
          $scope.selectedDocuments.push(document);
        } else {
          $log.debug('addItem - item is already in the list');
        }
      }
    }

    function openSearch() {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').focus();
    }

    function previousTab() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    }

    function reloadDocuments() {
      LinshareDocumentRestService.getList().then(function(data) {
        $scope.documentsList = data;
        $scope.isNewAddition = true;
        tableParamsService.reloadTableParams($scope.documentsList);
        $timeout(function() {
          $scope.isNewAddition = false;
        }, 0);
      }, 500);
    }

    function setTextInput($event) {
      var currTarget = $event.currentTarget;
      var inputTxt = angular.element(currTarget).text();
      if (inputTxt === '') {
        angular.element(currTarget).parent().find('span').css('display', 'block');
      } else {
        angular.element(currTarget).parent().find('span').css('display', 'none');
      }
    }

    /**
     * @name removeShare
     * @desc Remove a share from shares of a document
     * @param {string} shareUuid - Share uuid
     * @memberOf LinShare.document.documentController
     */
    function removeShare(shareUuid) {
      LinshareShareService.remove(shareUuid).then(function(data) {
        _.assign($scope.mainVm.sidebar.getData().currentSelectedDocument.current, data.document);
        $scope.mainVm.sidebar.getData().loadSidebarContent($scope.mainVm.sidebar.getData().lsAppConfig.details);
        _.remove($scope.mainVm.sidebar.getData().currentSelectedDocument.current.shares, {'uuid': shareUuid});
        _.assignIn(_.find($scope.documentsList, {'uuid': data.document.uuid}), data.document);
        var recipient = data.recipient.firstName ? data.recipient.firstName + ' ' + data.recipient.lastName :
          data.recipient.mail;
        toastService.success({
          key: 'GROWL_ALERT.ACTION.SHARE_DELETED',
          params: {recipient: recipient}
        });
      });
    }

    /**
     * @name showCurrentFile
     * @desc Get information from a file and show the sidebar details at a given tab
     * @param {Object} currentFile - A Document file object
     * @param {event} [event] - Event occuring launching the action
     * @param {boolean} [openDetailsSidebar] - Open details sidebar
     * @param {number} [tabIndex] - Index of the tab to display
     * @memberOf LinShare.document.documentController
     */
    function showCurrentFile(currentFile, event, openDetailsSidebar, tabIndex) {
      var deferred = $q.defer();
      $scope.currentSelectedDocument.current = currentFile;
      $q.all([
        LinshareDocumentRestService.get(currentFile.uuid),
        LinshareDocumentRestService.getAudit(currentFile.uuid)
      ]).then(function(promises) {
        $scope.currentSelectedDocument.current = promises[0];

        documentUtilsService.loadItemThumbnail($scope.currentSelectedDocument.current,
          LinshareDocumentRestService.thumbnail($scope.currentSelectedDocument.current.uuid));

        auditDetailsService.generateAllDetails($scope.userLogged.uuid, promises[1].plain())
          .then(function(auditActions) {
            $scope.currentSelectedDocument.current.auditActions = auditActions;

            if (openDetailsSidebar) {
              $scope.data.selectedIndex = tabIndex || 0;
              $scope.loadSidebarContent(lsAppConfig.details);
              if (!_.isUndefined(event)) {
                var currElm = event.currentTarget;
                angular.element('#file-list-table tr li').removeClass('activeActionButton').promise()
                  .done(function() {
                    angular.element(currElm).addClass('activeActionButton');
                  });
              }
            }
          });
      });
      deferred.resolve($scope.currentSelectedDocument.current);
      return deferred.promise;
    }

    function slideTextarea($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().addClass('show-full-comment');
    }

    function slideUpTextarea($event) {
      var currTarget = $event.currentTarget;
      angular.element(currTarget).parent().removeClass('show-full-comment');
    }

    function sortResponseDeletion(items, responsesDeletion) {
      if (items) {
        return _.map(items, function(restangularizedItem) {
          return restangularizedItem.remove().then(function() {
            _.remove($scope.documentsList, restangularizedItem);
            _.remove($scope.selectedDocuments, restangularizedItem);
            tableParamsService.reloadTableParams();
            tableParamsService.resetFlagsOnSelectedPages($scope.flagsOnSelectedPages);
            return responsesDeletion;
          }).catch(function(error) {
            responsesDeletion.push([restangularizedItem.name, error]);
            return responsesDeletion;
          });
        });
      }
    }

    function toggleSearchState() {
      if (!$scope.searchMobileDropdown) {
        $scope.openSearch();
      } else {
        $scope.closeSearch();
      }
      $scope.searchMobileDropdown = !$scope.searchMobileDropdown;
    }

    /**
     * Update a document
     * @param document
     */
    function updateDocument(document) {
      var documentServer = _.cloneDeep(document);
      $translate(['SAVING'])
        .then(function(translations) {
          /* jshint sub: true */
          var swalSaving = translations['SAVING'];
          $scope.currentSelectedDocument.current.description = swalSaving;
          LinshareDocumentRestService.update(documentServer.uuid, documentServer).then(function() {
            $scope.currentSelectedDocument.current.description = documentServer.description;
          });
        });
    }
  }
})();
