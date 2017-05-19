(function() {
  'use strict';

  angular
    .module('linshare.document')
    .controller('documentController', documentController);

  function documentController($scope, LinshareDocumentRestService, $translate, $translatePartialLoader, $log,
    documentsList, $timeout, documentUtilsService, $q, flowUploadService, itemUtilsService, lsAppConfig, toastService,
    $stateParams, tableParamsService, auditDetailsService) {

    var swalMultipleDownloadTitle, swalMultipleDownloadText, swalMultipleDownloadConfirm;
    var swalNoDeleteElements, swalNoDeleteElementsSingular,swalNoDeleteElementsPlural,  swalActionDelete, swalInfoErrorFile, swalClose;
    var swalCodeError404, swalCodeError403, swalCodeError400, swalCodeError500, toastDeleteSingularSuccess, toastDeletePluralSuccess;

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
    $scope.downloadFile = downloadFile;
    $scope.downloadSelectedFiles = downloadSelectedFiles;
    $scope.flagsOnSelectedPages = {};
    $scope.flowUploadService = flowUploadService;
    $scope.getDetails = getDetails;
    $scope.getDocumentInfo = getDocumentInfo;
    $scope.getDocumentThumbnail = getDocumentThumbnail;
    $scope.itemUtilsService = itemUtilsService;
    $scope.loadSidebarContent = loadSidebarContent;
    $scope.lsAppConfig = lsAppConfig;
    $scope.lsFormat = lsFormat;
    $scope.lsFullDateFormat = lsFullDateFormat;
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
    $scope.showCurrentFile = showCurrentFile;
    $scope.setTextInput = setTextInput;
    $scope.slideTextarea = slideTextarea;
    $scope.slideUpTextarea = slideUpTextarea;
    $scope.toggleSearchState = toggleSearchState;
    $scope.unavailableMultiDownload = unavailableMultiDownload;
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
          action: 'documents.upload({from: lsAppConfig.mySpacePage})',
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
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT',
          'SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON',
          'GROWL_ALERT.ACTION.DELETE', 'TOAST_ALERT.ACTION.INFO_ERROR_FILE',
          'TOAST_ALERT.ACTION.CLOSE', 'TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED',
          'TOAST_ALERT.ACTION.CLOSE', 'TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_SINGULAR',
          'TOAST_ALERT.ACTION.CLOSE', 'TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_PLURAL',
          'TOAST_ALERT.WARNING.ERROR_404', 'TOAST_ALERT.WARNING.ERROR_403',
          'TOAST_ALERT.WARNING.ERROR_400', 'TOAST_ALERT.WARNING.ERROR_500',
          'GROWL_ALERT.ACTION.DELETE_SINGULAR','GROWL_ALERT.ACTION.DELETE_PLURAL'
        ])
        .then(function(translations) {
          swalMultipleDownloadTitle = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TITLE'];
          swalMultipleDownloadText = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.TEXT'];
          swalMultipleDownloadConfirm = translations['SWEET_ALERT.ON_MULTIPLE_DOWNLOAD.CONFIRM_BUTTON'];
          swalActionDelete = translations['GROWL_ALERT.ACTION.DELETE'];
          swalInfoErrorFile = translations['TOAST_ALERT.ACTION.INFO_ERROR_FILE'];
          swalClose = translations['TOAST_ALERT.ACTION.CLOSE'];
          swalNoDeleteElements = translations['TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED'];
          swalNoDeleteElementsSingular = translations['TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_SINGULAR'];
          swalNoDeleteElementsPlural = translations['TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_PLURAL'];
          swalCodeError404 = translations['TOAST_ALERT.WARNING.ERROR_404'];
          swalCodeError403 = translations['TOAST_ALERT.WARNING.ERROR_403'];
          swalCodeError400 = translations['TOAST_ALERT.WARNING.ERROR_400'];
          swalCodeError500 = translations['TOAST_ALERT.WARNING.ERROR_500'];
          toastDeleteSingularSuccess = translations['GROWL_ALERT.ACTION.DELETE_SINGULAR'];
          toastDeletePluralSuccess = translations['GROWL_ALERT.ACTION.DELETE_PLURAL'];
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
      var nbItems = items.length;
      var responsesDeletion = [];
      $q.all(sortResponseDeletion(items, responsesDeletion)).then(function() {
        if (responsesDeletion.length > 0) {
         var txtMessage = responsesDeletion.length === 1 ? swalNoDeleteElementsSingular :responsesDeletion.length +
          swalNoDeleteElementsPlural;
          var responses = [];
          _.forEach(responsesDeletion, function(responseItems) {
            switch (responseItems[1].status) {
              case 404:
                responses.push({
                  'title': responseItems[0],
                  'message': swalCodeError404
                });
                break;
              case 403:
                responses.push({
                  'title': responseItems[0],
                  'message': swalCodeError403
                });
                break;
              case 400:
                responses.push({
                  'title': responseItems[0],
                  'message': swalCodeError400
                });
                break;
              default:
                responses.push({
                  'title': responseItems[0],
                  'message': swalCodeError500
                });
            }
          });
          toastService.error(txtMessage,undefined,responses);
        } else {
          var message = (nbItems === 1) ? toastDeleteSingularSuccess : toastDeletePluralSuccess;
          toastService.success(message);
          $timeout(function() {
            $scope.getUserQuotas();
          }, 350);
        }
      });
    }

    function deleteDocuments(items) {
      documentUtilsService.deleteDocuments(items, deleteCallback);
    }

    /**
     *  @name downloadFile
     *  @desc Download a file of a document for the user
     *  @param {Object) documentFile - A document object
     *  @memberOf LinShare.document.documentController
     */
    function downloadFile(documentFile) {
      var url = LinshareDocumentRestService.download(documentFile.uuid);
      itemUtilsService.download(url, documentFile.name);
    }

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

    function getDocumentThumbnail(uuid) {
      LinshareDocumentRestService.thumbnail(uuid).then(function(thumbnail) {
        $scope.currentSelectedDocument.current.thumbnail = thumbnail;
      });
    }

    /**
     * @name launchTableParamsInitiation
     * @desc Initialize tableParams and related functions
     * @memberOf LinShare.document.documentController
     */
    function launchTableParamsInitiation() {
      var fileToSearch = $stateParams.fileUuid || $stateParams.uploadedFileUuid;
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
            $translate('GROWL_ALERT.ERROR.FILE_NOT_FOUND').then(function(message) {
              toastService.error(message);
            });
          } else {
            $translate('TOAST_ALERT.WARNING.ISOLATED_FILE').then(function(message) {
              toastService.isolate(message);
              $scope.addSelectedDocument(data.itemToSelect);
              $scope.toggleFilterBySelectedFiles();
              $scope.showCurrentFile(data.itemToSelect);
            });
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
     * @name showCurrentFile
     * @desc Get information from a file and show the sidebar details at a given tab
     * @param {Object} currentFile - A Document file object
     * @param {event} [event] - Event occuring launching the action
     * @param {boolean} [openDetailsSidebar] - Open details sidebar
     * @memberOf LinShare.document.documentController
     */
    function showCurrentFile(currentFile, event, openDetailsSidebar) {
      var deferred = $q.defer();
      $scope.currentSelectedDocument.current = currentFile;
      $q.all([
        LinshareDocumentRestService.get(currentFile.uuid),
        LinshareDocumentRestService.getAudit(currentFile.uuid)]).then(function(promises) {
        $scope.currentSelectedDocument.current = promises[0];

        if (currentFile.hasThumbnail) {
          LinshareDocumentRestService.thumbnail(currentFile.uuid).then(function(thumbnail) {
            $scope.currentSelectedDocument.current.thumbnail = thumbnail;
          });
        }

        auditDetailsService.generateAllDetails($scope.userLogged.uuid, promises[1].plain()).then(function(auditActions) {
          $scope.currentSelectedDocument.current.auditActions = auditActions;
          if(openDetailsSidebar) {
            $scope.data.selectedIndex = 0;
            $scope.loadSidebarContent(lsAppConfig.details);
            if (!_.isUndefined(event)) {
              var currElm = event.currentTarget;
              angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
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

    function unavailableMultiDownload() {
      swal({
        title: swalMultipleDownloadTitle,
        text: swalMultipleDownloadText,
        type: 'error',
        confirmButtonColor: '#05b1ff',
        confirmButtonText: swalMultipleDownloadConfirm,
        closeOnConfirm: true
      });
    }
  }
})();
