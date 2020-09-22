(function() {
  'use strict';

  angular
    .module('linshare.document')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('filesList');
    }])
    .controller('documentController', documentController);

  // TODO: Should dispatch some function to other service or controller
  /* jshint maxparams: false, maxstatements: false */
  function documentController(
    _,
    $filter,
    $log,
    $q,
    $scope,
    $state,
    $timeout,
    $transition$,
    $transitions,
    $translate,
    auditDetailsService,
    browseService,
    documentPreviewService,
    documentsList,
    documentUtilsService,
    flowUploadService,
    functionalities,
    LinshareShareService,
    LinshareDocumentRestService,
    lsAppConfig,
    toastService,
    tableParamsService
  )
  {
    var reloadTableParamsTimeoutReference;

    $scope.addUploadedDocument = addUploadedDocument;
    $scope.backToSidebarContentDetails = backToSidebarContentDetails;
    $scope.closeDetailSidebar = closeDetailSidebar;
    $scope.closeSearch = closeSearch;
    $scope.copyDocuments = copyDocuments;
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
    $scope.multiDownload = multiDownload;
    $scope.mySpacePage = lsAppConfig.mySpacePage;
    $scope.nextTab = nextTab;
    $scope.onShare = onShare;
    $scope.openBrowser = openBrowser;
    $scope.openSearch = openSearch;
    $scope.paramFilter = {
      name: ''
    };
    $scope.previousTab = previousTab;
    $scope.recipientShareDetails = {
      current: ''
    };
    $scope.removeShare = removeShare;
    $scope.searchShareUsers = searchShareUsers;
    $scope.searchShareUsersInput = '';
    $scope.showCurrentFile = showCurrentFile;
    $scope.setTextInput = setTextInput;
    $scope.slideTextarea = slideTextarea;
    $scope.slideUpTextarea = slideUpTextarea;
    $scope.toggleSearchState = toggleSearchState;
    $scope.updateDocument = updateDocument;
    $scope.functionalities = functionalities;
    $scope.canCopyInWorkGroup = functionalities.WORK_GROUP && functionalities.WORK_GROUP.enable;

    activate();

    ////////////////

    function activate() {
      //TODO - PREVIEW: Shall be removed once every functions are defined in an external service
      Object.assign(
        documentPreviewService,
        {
          download: downloadFile,
          //TODO - PREVIEW: Functions should be callable from a external service
          //TODO - PREVIEW: Function shall be split in two to accept both an array and a single element
          copyToMySpace: undefined,
          copyToWorkgroup: function (item) {
            openBrowser([item]);
          },
          showItemDetails: function (item) {
            showCurrentFile(item, undefined, true);
          }
        }
      );

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
          reloadTableParamsWhenPossible();
        });
      }
    }

    /**
     * @name reloadTableParamsWhenPossible
     * @desc Call reloadTableParams when this function is not re-called in a second
     * @returns {Void}
     * @memberOf linshare.document.documentController
     */
    function reloadTableParamsWhenPossible() {
      if (reloadTableParamsTimeoutReference) {
        $timeout.cancel(reloadTableParamsTimeoutReference);
      }

      reloadTableParamsTimeoutReference = $timeout(function() {
        reloadTableParamsTimeoutReference = undefined;

        tableParamsService.reloadTableParams();
      }, 1000);
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

    /**
     * @name deleteCallback
     * @desc Callback to delete documents
     * @param {Array<Object>} items - List of items to be deleted
     * @memberOf LinShare.document.documentController
     */
    function deleteCallback(items) {
      deleteItems(items).then(function(deleteItemsResponse) {
        if (deleteItemsResponse.nonDeletedItems.length > 0) {
          showErrorNotificationForNonDeletedItems(deleteItemsResponse.nonDeletedItems);
        } else {
          showSuccessNotificationForDeletedItems(deleteItemsResponse.deletedItems);

          $timeout(function() {
            $scope.getUserQuotas();
          }, 350);
        }
      });
    }

    /**
     * @name deleteItems
     * @desc Delete documents
     * @param {Array<Object>} items - List of items to be deleted
     * @returns {Object} Deleted and nonDeleted items
     * @memberOf LinShare.document.documentController
     */
    function deleteItems(items) {
      if (!items) {
        return $q.when([]);
      }

      return $q.allSettled(_.map(items, function(item) { return item.remove(); })
      ).then(function(removeItemsValues) {
        var deletedItems = getFulfilledValues(removeItemsValues);
        var nonDeletedItems = getRejectedReasons(removeItemsValues);

        _.remove($scope.documentsList, function(document) {
          return isDocumentContainedInCollection(deletedItems, document);
        });
        _.remove($scope.selectedDocuments, function(selectedDocument) {
          return isDocumentContainedInCollection(deletedItems, selectedDocument);
        });

        tableParamsService.reloadTableParams();
        tableParamsService.resetFlagsOnSelectedPages($scope.flagsOnSelectedPages);

        return {
          deletedItems: deletedItems,
          nonDeletedItems: nonDeletedItems
        };
      });
    }

    /**
     * @name getFulfilledValues
     * @desc Get deleted items
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted document
     * @memberOf LinShare.document.documentController
     */
    function getFulfilledValues(allSettledAnswer) {
      return _.map(
        _.filter(
          allSettledAnswer,
          { state: 'fulfilled' }
        ),
        'value'
      );
    }

    /**
     * @name getRejectedReasons
     * @desc Get the reasons for which server was not able to delete nodes
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted document
     * @memberOf LinShare.document.documentController
     */
    function getRejectedReasons(allSettledAnswer) {
      return _.map(
        _.filter(
          allSettledAnswer,
          { state: 'rejected' }
        ),
        'reason'
      );
    }

    /**
     * @name isDocumentContainedInCollection
     * @desc Detect if the document is contained in the collection by leveraging its uuid
     * @param {Array<Object>} collection - List of document object
     * @param {Object} document - A document object
     * @memberOf LinShare.document.documentController
     */
    function isDocumentContainedInCollection(collection, document) {
      var indexOfDocumentInCollection = _.findIndex(collection, function(collectionItem) {
        return collectionItem.uuid === document.uuid;
      });

      return indexOfDocumentInCollection !== -1;
    }

    /**
     * @name showErrorNotificationForNonDeletedItems
     * @desc Show error notification about non-deleted documents
     * @param {Array<Object>} nonDeletedItems - List of non-deleted documents
     * @memberOf LinShare.document.documentController
     */
    function showErrorNotificationForNonDeletedItems(nonDeletedItems) {
      var responses = [];
      var message = (nonDeletedItems.length === 1) ?
        {
          key: 'TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_SINGULAR'
        } :
        {
          key: 'TOAST_ALERT.WARNING.ELEMENTS_NOT_DELETED_PLURAL',
          params: {
            number: nonDeletedItems.length
          }
        };

      _.forEach(nonDeletedItems, function(nonDeletedItem) {
        var currentResponse = {
          title: nonDeletedItem.config && nonDeletedItem.config.data && nonDeletedItem.config.data.name || 'No title',
          message: {
            params: {
              errCode: nonDeletedItem.data && nonDeletedItem.data.errCode
            }
          }
        };

        switch(nonDeletedItem.status) {
          case 400:
          case 403:
          case 404:
            currentResponse.message.key = 'TOAST_ALERT.WARNING.ERROR_' + nonDeletedItem.status;
            break;
          default:
            currentResponse.message.key = 'TOAST_ALERT.WARNING.ERROR_500';
        }

        responses.push(currentResponse);
      });

      toastService.error(message, undefined, responses);
    }

    /**
     * @name showSuccessNotificationForDeletedItems
     * @desc Show success notification about deleted documents
     * @param {Array<Object>} deletedItems - List of deleted documents
     * @memberOf LinShare.document.documentController
     */
    function showSuccessNotificationForDeletedItems(deletedItems) {
      var message = (deletedItems.length === 1) ?
        'TOAST_ALERT.ACTION.DELETE_SINGULAR' :
        'TOAST_ALERT.ACTION.DELETE_PLURAL';

      toastService.success({ key: message });
    }

    /**
     * @name copyDocuments
     * @desc Copy documents
     * @param {Array<Object>} documents - List of documents to copy
     * @memberOf LinShare.document.documentController
     */
    function copyDocuments(documents) {
      _.forEach(documents, function(document) {
        LinshareDocumentRestService.copy(document.uuid).then(function(documents) {
          toastService.success({
            key: 'TOAST_ALERT.ACTION.COPY_SAME_FOLDER',
            pluralization: true,
            params: {singular: true}
          });
          
          return LinshareDocumentRestService.restangularize(documents[0]).get();
        }).then(function(document) {
          $scope.documentsList.push(document);
          tableParamsService.reloadTableParams();
        });
      });
    }

    function deleteDocuments(items) {
      documentUtilsService.deleteItem(items, documentUtilsService.itemUtilsConstant.DOCUMENT, deleteCallback);
      $scope.mainVm.sidebar.hide();
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

    function getDetails(item, list, index) {
      index = index || 0;
      list = Array.isArray(list) && list.length ? list : [item];
      
      return $scope.showCurrentFile(item, null, { index, list });
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
      var fileToSearch = $transition$.params().fileUuid || $transition$.params().uploadedFileUuid;

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

          if ($transition$.params().fileUuid) {
            if (_.isNil(data.itemToSelect)) {
              toastService.error({key: 'TOAST_ALERT.ERROR.FILE_NOT_FOUND'});
            } else {
              toastService.isolate({key: 'TOAST_ALERT.WARNING.ISOLATED_FILE'});
              $scope.addSelectedDocument(data.itemToSelect);
              $scope.toggleFilterBySelectedFiles();
              if (!$scope.isMobile) {
                $scope.showCurrentFile(data.itemToSelect);
              }
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

    /**
     * @name  multiDownload
     * @desc Trigger multiple download of items with a confirm dialog if needed
     * @memberOf LinShare.document.documentController
     */
    function multiDownload() {
      documentUtilsService
        .canShowMultipleDownloadConfirmationDialog($scope.selectedDocuments).then(function() {
          downloadSelectedFiles($scope.selectedDocuments);
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

    /**
     * @name openBrowser
     * @desc Open browser of folders to copy documents
     * @param {Array<Object>} documents - Documents to copy
     * @memberOf LinShare.document.documentController
     */
    function openBrowser(documents) {
      browseService.show({
        nodeItems: documents,
        isMove: false,
        kind: 'PERSONAL_SPACE'
      }).then(function(data) {
        if (data.failedNodes.length) {
          notifyBrowseActionError(data);
        } else {
          notifyBrowseActionSuccess(data);
        }
      });
    }

    /**
     * @name notifyBrowseActionError
     * @desc Notify when an error occurred on copy documents
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.document.documentController
     */
    function notifyBrowseActionError(data) {
      var responses = [];

      _.forEach(data.failedNodes, function(error) {
        switch(error.data.errCode) {
          case 26444 :
            responses.push({
              'title': error.nodeItem.name,
              'message': {key: 'TOAST_ALERT.ERROR.COPY.26444'}
            });
            break;
          case 26445 :
          case 28005 :
            responses.push({
              'title': error.nodeItem.name,
              'message': {key: 'TOAST_ALERT.ERROR.RENAME_NODE'}
            });
            break;
        }
      });

      toastService.error({
        key: 'TOAST_ALERT.ERROR.BROWSER_ACTION',
        pluralization: true,
        params: {
          action: '',
          nbNodes: data.failedNodes.length,
          singular: data.failedNodes.length === 1 ? 'true' : ''
        }
      }, undefined, responses.length ? responses : undefined);
    }

    /**
     * @name notifyBrowseActionSuccess
     * @desc Notify success on copy documents
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.document.documentController
     */
    function notifyBrowseActionSuccess(data) {
      toastService.success({
        key: 'TOAST_ALERT.ACTION.BROWSER_ACTION',
        pluralization: true,
        params: {
          singular: data.nodeItems.length <= 1 ? 'true' : '',
          action: '',
          folderName: data.folder.name
        }
      }, 'TOAST_ALERT.ACTION_BUTTON').then(function(response) {
        if (!_.isUndefined(response)) {
          if (response.actionClicked) {
            var nodeToSelectUuid = data.nodeItems.length === 1 ? data.nodeItems[0].uuid : null;
            var routeStateSuffix = data.folder.parent === data.folder.workGroup ? 'root' : 'folder';

            $state.go('sharedspace.workgroups.' + routeStateSuffix, {
              workgroupUuid: data.folder.workGroup,
              workgroupName: data.folder.workgroupName,
              parentUuid: data.folder.parent,
              folderUuid: data.folder.uuid,
              folderName: data.folder.name,
              uploadedFileUuid: nodeToSelectUuid
            });
          }
        }
      });
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
        tableParamsService.reloadTableParams($scope.documentsList);
      }, 500);
    }

    /**
     * @name searchShareUsers
     * @desc Filter users in share list
     * @param {string} searchShareUsersInput - Value enterred in the search input
     * @memberOf LinShare.document.documentController
     */
    function searchShareUsers(searchShareUsersInput) {
      return function(share) {
        var name = share.recipient.firstName + ' ' + share.recipient.lastName;

        
        return name.toLowerCase().indexOf(searchShareUsersInput.toLowerCase()) !== -1;
      };
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
          key: 'TOAST_ALERT.ACTION.SHARE_DELETED',
          params: {recipient: recipient}
        });
      });
    }

    /**
     * @name showCurrentFile
     * @desc Get information from a file and show the sidebar details at a given tab
     * @param {Object} currentFile - A Document file object
     * @param {event} [event] - Event occuring launching the action
     * @param {Object} data - Contains openDetailsSidebar, tabIndex, list of documents & index of document
     * @memberOf LinShare.document.documentController
     */
    function showCurrentFile(currentFile, event, data = {}) {
      var { openDetailsSidebar, tabIndex, list, index } = data;
      var deferred = $q.defer();

      $scope.searchShareUsersInput = '';
      $scope.currentSelectedDocument.current = currentFile;
      $scope.currentSelectedDocument.index = index || 0;
      $scope.currentList = Array.isArray(list) && list.length ? list : [currentFile];
      $q.all([
        LinshareDocumentRestService.get(currentFile.uuid),
        LinshareDocumentRestService.getAudit(currentFile.uuid)
      ]).then(function(promises) {
        $scope.currentSelectedDocument.current = promises[0];
        $scope.currentSelectedDocument.recipients = _.map(
          promises[0].shares,
          'recipient'
        );

        documentUtilsService.loadItemThumbnail($scope.currentSelectedDocument.current,
          LinshareDocumentRestService.thumbnail.bind(null, $scope.currentSelectedDocument.current.uuid));

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
      var documentServer = _.omit(_.cloneDeep(document), ['thumbnailUnloadable']);

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
