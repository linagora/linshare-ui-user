/**
 * ReceivedController Controller
 * @namespace LinShare.receivedShare
 */
angular
  .module('linshare.receivedShare')
  .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('receivedShare');
  }])
  .controller('ReceivedController', function(
    $log,
    $q,
    $scope,
    $state,
    $transitions,
    _,
    auditDetailsService,
    authenticationRestService,
    browseService,
    documentsToIsolate,
    documentUtilsService,
    files,
    functionalities,
    lsAppConfig,
    receivedShareRestService,
    toastService,
    documentPreviewService,
    tableParamsService
  ) {
    $scope.copyIntoFiles = copyIntoFiles;
    $scope.deleteDocuments = deleteDocuments;
    $scope.documentsList = files;
    $scope.downloadFile = downloadFile;
    $scope.loadSidebarContent = loadSidebarContent;
    $scope.multiDownload = multiDownload;
    $scope.openBrowser = openBrowser;
    $scope.selectDocuments = selectDocuments;
    $scope.showCurrentFile = showCurrentFile;
    $scope.toggleSearchState = toggleSearchState;
    $scope.onForward = onForward;
    $scope.functionalities = functionalities;

    $scope.advancedFilterBool = false;
    $scope.selectedDocuments = [];
    $scope.paramFilter = {
      name: ''
    };
    $scope.currentPage = 'received_files';
    $scope.currentSelectedDocument = {
      current: ''
    };
    $scope.flagsOnSelectedPages = {};
    $scope.canCopyInWorkGroup = functionalities.WORK_GROUP && functionalities.WORK_GROUP.enable;

    this.$onInit = activate;

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function activate() {
      //TODO - PREVIEW: Shall be removed once every functions are defined in an external service
      Object.assign(
        documentPreviewService,
        {
          download: downloadFile,
          copyToMySpace: copyIntoFiles,
          //TODO - PREVIEW: Functions should be callable from a external service
          //TODO - PREVIEW: Function shall be split in two to accept both an array and a single element
          copyToWorkgroup: function (item) {
            openBrowser([item]);
          },
          showItemDetails: showCurrentFile
        }
      );

      authenticationRestService.getCurrentUser().then(userData => {
        $scope.canUpload = userData.canUpload;


        if (documentsToIsolate !== null) {
          selectDocuments(
            documentsToIsolate,
            $scope.tableParams
          );

          $scope.toggleFilterBySelectedFiles();
        }

        if (!$scope.isMobile && $scope.selectedDocuments.length === 1) {
          $scope.showCurrentFile($scope.selectedDocuments[0]);
        }
      })
        .then(launchTableParamsInitiation)
        .catch(function(error) {
          $log.debug(error);
        });

      $transitions.onSuccess({}, function() {
        angular.element('.multi-select-mobile').appendTo('body');
      });
    }

    /**
     * @name copyIntoFiles
     * @desc Copy selected files into the Personal Space
     * @param {Array<Object>} selectedDocuments - Documents to copy
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function copyIntoFiles(selectedDocuments) {
      if (!$scope.canUpload) {
        return;
      }

      if (!_.isArray(selectedDocuments)) {
        selectedDocuments = [selectedDocuments];
      }

      //TODO: success response should be managed globally in serverManagerService
      receivedShareRestService.copy(selectedDocuments).then(function(data) {
        toastService.success({
          key: 'TOAST_ALERT.ACTION.COPY',
          pluralization: true,
          params: {
            singular: data.length === 1,
            nbItems: data.length
          }
        },
        'TOAST_ALERT.ACTION_BUTTON'
        ).then(function(response) {
          if (response && response.actionClicked) {
            $state.go('documents.files', {
              uploadedFileUuid: data.length === 1 ? data[0].uuid : null
            });
          }
        });
      });
    }

    /**
     * @name deleteDocuments
     * @desc Delete given documents
     * @param {Array<Object>} items - documents to delete
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function deleteDocuments(items) {
      documentUtilsService.deleteItem(
        items,
        documentUtilsService.itemUtilsConstant.RECEIVED_SHARE,
        deleteCallback
      );
      $scope.mainVm.sidebar.hide();
    }

    /**
     * @name deleteCallback
     * @desc Execute deletion of given documents
     * @param {Array<Object>} items - documents to delete
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function deleteCallback(items) {
      // TODO : show a single callback toast for the deleted item(s), and check if it needs to be plural or not
      angular.forEach(
        items,
        function(restangularizedItem) {
          $log.debug('value to delete', restangularizedItem);

          restangularizedItem.remove().then(function() {
            _.remove(
              $scope.documentsList,
              restangularizedItem
            );
            _.remove(
              $scope.selectedDocuments,
              restangularizedItem
            );
            tableParamsService.reloadTableParams($scope.documentsList);
            $scope.flagsOnSelectedPages = {};
            toastService.success({ key: 'TOAST_ALERT.ACTION.DELETE_SINGULAR' });
          });
        }
      );
    }

    /**
     *  @name downloadFile
     *  @desc Download a file of a document for the user
     *  @param {Object} documentFile - A document object
     *  @memberOf LinShare.receivedShare.receivedShareController
     */
    function downloadFile(documentFile) {
      var url = receivedShareRestService.download(documentFile.uuid);

      documentUtilsService.download(
        url,
        documentFile.name
      );
    }

    /**
     * @name downloadSelectedFiles
     * @desc Download selected files
     * @param {Array<Object>} selectedDocuments - List of selected documents
     * @memberOf LinShare.receivedShare.receivedShareController
     */
    function downloadSelectedFiles(selectedDocuments) {
      _.forEach(
        selectedDocuments,
        function(document) {
          $scope.downloadFile(document);
        }
      );
    }

    /**
     * @name getReceivedShareAudit
     * @desc Get audit details of a receivedShare object
     * @param {Object} receivedShare - receivedShare object
     * @returns {Promise} receivedShare object with audit details
     * @memberOf LinShare.receivedShare.receivedShareController
     */
    function getReceivedShareAudit(receivedShare) {
      return receivedShareRestService.getAudit(receivedShare.uuid)
        .then(function(auditData) {
          auditDetailsService.generateAllDetails(
            $scope.userLogged.uuid,
            auditData.plain()
          )
            .then(function(auditActions) {
              $scope.currentSelectedDocument.current.auditActions = auditActions;
            });
        });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {String} cotent The id of the content to load, see app/views/includes/sidebar-right.html
     * for possible values
     */
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData($scope);
      $scope.mainVm.sidebar.setContent(content || lsAppConfig.share);
      $scope.mainVm.sidebar.show();
    }

    function launchTableParamsInitiation() {
      tableParamsService.initTableParams($scope.documentsList, $scope.paramFilter)
        .then(function() {
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
        });
    }

    /**
     * @name  multiDownload
     * @desc Trigger multiple download of items with a confirm dialog if needed
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function multiDownload() {
      documentUtilsService
        .canShowMultipleDownloadConfirmationDialog($scope.selectedDocuments).then(function() {
          downloadSelectedFiles($scope.selectedDocuments);
        });
    }

    /**
     * @name notifyBrowseActionError
     * @desc Notify when an error occurred on copy documents
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function notifyBrowseActionError(data) {
      var responses = [];

      _.forEach(
        data.failedNodes,
        function(error) {

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
        }
      );

      toastService.error(
        {
          key: 'TOAST_ALERT.ERROR.BROWSER_ACTION',
          pluralization: true,
          params: {
            action: '',
            nbNodes: data.failedNodes.length,
            singular: data.failedNodes.length === 1 ? 'true' : ''
          }
        },
        undefined,
        responses.length ? responses : undefined
      );
    }

    /**
     * @name notifyBrowseActionSuccess
     * @desc Notify success on copy documents
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function notifyBrowseActionSuccess(data) {
      toastService.success(
        {
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

            $state.go(
              'sharedspace.workgroups.' + routeStateSuffix,
              {
                workgroupUuid: data.folder.workGroup,
                workgroupName: data.folder.workgroupName,
                parentUuid: data.folder.parent,
                folderUuid: data.folder.uuid,
                folderName: data.folder.name,
                uploadedFileUuid: nodeToSelectUuid
              }
            );
          }
        }
      });
    }

    /**
     * @name openBrowser
     * @desc Open browser of folders to copy documents
     * @param {Array<Object>} documents - Documents to copy
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function openBrowser(documents) {
      browseService.show({
        nodeItems: documents,
        isMove: false,
        kind: 'RECEIVED_SHARE'
      }).then(function(data) {
        if (data.failedNodes.length) {
          notifyBrowseActionError(data);
        } else {
          notifyBrowseActionSuccess(data);
        }
      });
    }

    /**
     * @name selectDocuments
     * @desc trigger selected documents and selected pages
     * @param {Object} documents - selected documents
     * @param {Object} tableParams - table params
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    //TODO Avoid mutation!
    function selectDocuments(documents, tableParams){
      var documentsAndFlagsIsolated = setIsolateMode(
        documents,
        tableParams.page()
      );

      /* All of below should be in setIsolateMode when the mutation Pattern is corrected */
      $scope.documentsList = _.union(
        $scope.documentsList,
        documentsAndFlagsIsolated.selectedDocuments
      );
      $scope.selectedDocuments = _.union(
        $scope.selectedDocuments,
        documentsAndFlagsIsolated.selectedDocuments
      );
      $scope.flagsOnSelectedPages = _.union(
        $scope.flagsOnSelectedPages,
        documentsAndFlagsIsolated.flagsOnSelectedPages
      );
    }

    /**
     * @name setDocumentsAsSelected
     * @desc Return a new array with given documents property `ìsSelected` to true
     * @param {Object[]} documentsToSelect - An array of Document file object
     * @returns {Object[]} An array of Document file object set to `isSelected` to true
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function setDocumentsAsSelected(documentsToSelect) {
      return _.map(
        documentsToSelect,
        function(document) {
          return Object.assign(
            document,
            { isSelected: true }
          );
        }
      );
    }

    /**
     *  @name setDocumentsAndFlagAsSelected
     *  @desc Set documents and flags of current page as selected
     *  @param {string[]} filesToIsolate - Array of document uuid to select
     *  @param {number} pageNumber - Page number of element to be selected
     *  @returns {Object} Contains documents and element per page selected
     *  @returns {Object.selectedDocuments} Array of document selected
     *  @returns {Object.flagsOnSelectedPages} elements per page selected
     *  @memberOf LinShare.receivedShare.receivedShareController
     */
    function setDocumentsAndFlagAsSelected(filesToSelect, pageNumber) {
      /* I LOVE ES6 ... */
      var flag = {};

      flag[pageNumber] = true;

      var documentsAndFlagsSelected = {
        selectedDocuments: setDocumentsAsSelected(filesToSelect),
        flagsOnSelectedPages: flag
      };

      return documentsAndFlagsSelected;
    }

    /**
     *  @name setIsolateMode
     *  @desc select documents and flags to isolate and trigger toast `isolation`
     *  @param {string[]} filesToIsolate - Array of document uuid to select
     *  @param {number} pageNumber - Page number of element to be selected
     */
    function setIsolateMode(documentsToIsolate, pageNumber) {
      var documentsAndFlagsSelected = setDocumentsAndFlagAsSelected(
        documentsToIsolate,
        pageNumber
      );

      triggerIsolateToast(documentsAndFlagsSelected.selectedDocuments);

      return documentsAndFlagsSelected;
    }

    /**
     * @name showCurrentFile
     * @desc Get information from a file and show the sidebar details at a given tab
     * @param {Object} currentFile - A Document file object
     * @param {event} [event] - Event occuring launching the action
     * @param {boolean} [openDetailsSidebar] - Open details sidebar
     * @param {number} [tabIndex] - Index of the tab to display
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function showCurrentFile(currentFile, event) {
      return $q(function(resolve) {
        $scope.currentSelectedDocument.current = currentFile;

        if (currentFile.shared > 0) {
          receivedShareRestService.get(currentFile.uuid).then(function(data) {
            $scope.currentSelectedDocument.current.shares = data.shares;
          });
        }

        documentUtilsService.loadItemThumbnail(
          $scope.currentSelectedDocument.current,
          receivedShareRestService.thumbnail.bind(
            null,
            $scope.currentSelectedDocument.current.uuid
          )
        );

        resolve($scope.currentSelectedDocument.current);

        getReceivedShareAudit($scope.currentSelectedDocument.current).then(function() {
          loadSidebarContent(lsAppConfig.details);

          if (!_.isUndefined(event)) {
            var currElm = event.currentTarget;

            angular.element('#file-list-table tr li').removeClass('activeActionButton').promise().done(function() {
              angular.element(currElm).addClass('activeActionButton');
            });
          }
        });
      });
    }

    /**
     * @name toggleSearchState
     * @desc open/close search input
     * @memberOf LinShare.receivedShare.ReceivedController
     */
    function toggleSearchState() {
      if (!$scope.searchMobileDropdown) {
        angular.element('#drop-area').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      } else {
        angular.element('#drop-area').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      }

      $scope.searchMobileDropdown = !$scope.searchMobileDropdown;
    }

    /**
     * @name triggerIsolateToast
     * @desc trigger toast show of isolate mode or error on element not found
     * @param {string[]} filesToIsolate - Array of document uuid
     * @return {Promise} Toast response
     * @memberOf LinShare.receivedShare.receivedShareController
     */
    function triggerIsolateToast(filesToIsolate) {
      if (filesToIsolate.length === 0 ) {
        return toastService.error({ key: 'TOAST_ALERT.ERROR.FILE_NOT_FOUND' });
      }

      return toastService.isolate({ key: 'TOAST_ALERT.WARNING.ISOLATED_FILE' });
    }

    /**
     * @name onForward
     * @desc open sidebar content for forwarding files
     * @param {object} documentFile - document
     * @memberOf LinShare.receivedShare.receivedShareController
     */
    function onForward(document) {
      if (document) {
        const index = $scope.selectedDocuments.indexOf(document);

        if (index === -1) {
          document.isSelected = true;
          $scope.selectedDocuments.push(document);
        } else {
          $log.debug('addItem - item is already in the list');
        }
      }

      loadSidebarContent(lsAppConfig.forward);
    }
  });
