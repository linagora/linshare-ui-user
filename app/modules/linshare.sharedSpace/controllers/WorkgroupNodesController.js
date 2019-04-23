/**
 * WorkgroupNodesController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('filesList');
      $translatePartialLoaderProvider.addPart('sharedspace');
    }])
    .controller('WorkgroupNodesController', WorkgroupNodesController);

  WorkgroupNodesController.$inject = [
    '_',
    '$filter',
    '$q',
    '$scope',
    '$state',
    '$timeout',
    '$transition$',
    '$translate',
    'user',
    'auditDetailsService',
    'browseService',
    'currentFolder',
    'documentPreviewService',
    'documentUtilsService',
    'filterBoxService',
    'flowUploadService',
    'functionalityRestService',
    'lsAppConfig',
    'lsErrorCode',
    'nodesList',
    'tableParamsService',
    'toastService',
    'workgroup',
    'workgroupMembersRestService',
    'workgroupNodesRestService',
    'workgroupPermissions',
    'workgroupRestService',
    'workgroupRole'
  ];
  /**
   * @namespace WorkgroupNodesController
   * @desc Application Workgroup Nodes system controller
   * @memberOf LinShare.sharedSpace
   */
  /* jshint maxparams: false, maxstatements: false */
  function WorkgroupNodesController(
    _,
    $filter,
    $q,
    $scope,
    $state,
    $timeout,
    $transition$,
    $translate,
    user,
    auditDetailsService,
    browseService,
    currentFolder,
    documentPreviewService,
    documentUtilsService,
    filterBoxService,
    flowUploadService,
    functionalityRestService,
    lsAppConfig,
    lsErrorCode,
    nodesList,
    tableParamsService,
    toastService,
    workgroup,
    workgroupMembersRestService,
    workgroupNodesRestService,
    workgroupPermissions,
    workgroupRestService,
    workgroupRole
  )
  {
    /* jshint validthis:true */
    var workgroupNodesVm = this;

    const TYPE_DOCUMENT = 'DOCUMENT';
    const TYPE_FOLDER = 'FOLDER';

    var newFolderName;

    workgroupNodesVm.functionalities = {};
    workgroupNodesVm.canDeleteNodes = false;
    workgroupNodesVm.TYPE_DOCUMENT = TYPE_DOCUMENT;
    workgroupNodesVm.role = workgroupRole;
    workgroupNodesVm.permissions = workgroupPermissions;
    workgroupNodesVm.addUploadedDocument = addUploadedDocument;
    workgroupNodesVm.areAllSameType = areAllSameType;
    workgroupNodesVm.breadcrumb = [];
    workgroupNodesVm.canCreateFolder = true;
    workgroupNodesVm.copyNode = copyNode;
    workgroupNodesVm.copyNodeToPersonalSpace = copyNodeToPersonalSpace;
    workgroupNodesVm.createFolder = createFolder;
    workgroupNodesVm.currentFolder = currentFolder;
    workgroupNodesVm.currentPage = 'workgroup_nodes';
    workgroupNodesVm.currentSelectedDocument = {};
    workgroupNodesVm.deleteNodes = deleteNodes;
    workgroupNodesVm.downloadFile = downloadFile;
    workgroupNodesVm.flowUploadService = flowUploadService;
    workgroupNodesVm.folderDetails = _.cloneDeep($transition$.params());
    workgroupNodesVm.getNodeDetails = getNodeDetails;
    workgroupNodesVm.goToFolder = goToFolder;
    workgroupNodesVm.goToPreviousFolder = goToPreviousFolder;
    workgroupNodesVm.isDocument = isDocument;
    workgroupNodesVm.loadSidebarContent = loadSidebarContent;
    workgroupNodesVm.mdtabsSelection = {
      selectedIndex: 0
    };
    workgroupNodesVm.multiDownload = multiDownload;
    workgroupNodesVm.nodesList = nodesList;
    workgroupNodesVm.openBrowser = openBrowser;
    workgroupNodesVm.paramFilter = {
      name: ''
    };
    workgroupNodesVm.renameNode = renameNode;
    workgroupNodesVm.showSelectedNodeDetails = showSelectedNodeDetails;
    workgroupNodesVm.showWorkgroupDetails = showWorkgroupDetails;
    workgroupNodesVm.upload = upload;
    workgroupNodesVm.workgroupPage = lsAppConfig.workgroupPage;
    workgroupNodesVm.workgroupNode = lsAppConfig.workgroupNode;
    workgroupNodesVm.thumbnailEngineActivated = lsAppConfig.thumbnailEngineActivated;

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function activate() {

      workgroupNodesVm.canCopyNodeToPersonalSpace = false;

      functionalityRestService
        .getAll()
        .then(function(functionalities) {
          workgroupNodesVm.functionalities.contactsList = functionalities.CONTACTS_LIST__CREATION_RIGHT;
          workgroupNodesVm.canCopyNodeToPersonalSpace = user.canUpload;
        });

      Object.assign(
        documentPreviewService,
        {
          download: downloadFile,
          copyToMySpace: function(item) {
            copyNodeToPersonalSpace([item]);
          },
          copyToWorkgroup: function(item) {
            openBrowser([item]);
          },
          showItemDetails: function(item) {
            showSelectedNodeDetails(item);
          }
        }
      );

      $translate.refresh().then(function() {
        $translate('ACTION.NEW_FOLDER').then(function(translationOfNewFolder) {
          newFolderName = translationOfNewFolder;
        });
      });

      workgroupNodesVm.folderDetails.workgroupName = workgroup.name;
      workgroupNodesVm.folderDetails.quotaUuid = workgroup.quotaUuid;
      workgroupNodesVm.folderDetails.folderName = currentFolder.name;

      getBreadcrumb();
      setFabConfig();
      getWorkgroupMemberDetails();
      launchTableParamsInitiation();
    }

    /**
     * @name addNewItemInTableParams
     * @desc Add new item in list and reload tableParams
     * @param {object} newItem - Node to add in tableParams
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function addNewItemInTableParams(newItem) {
      workgroupNodesVm.nodesList.push(newItem);
      workgroupNodesVm.tableParamsService.reloadTableParams();
    }

    /**
     * @name addUploadedDocument
     * @desc Add uploaded document to the list
     * @param {object} flowFile - Upload file
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function addUploadedDocument(flowFile) {
      if (flowFile._from === workgroupNodesVm.workgroupPage) {
        if (flowFile.folderDetails.workgroupUuid === workgroupNodesVm.folderDetails.workgroupUuid &&
          flowFile.folderDetails.folderUuid === workgroupNodesVm.folderDetails.folderUuid) {
          flowFile.asyncUploadDeferred.promise.then(function(file) {
            addNewItemInTableParams(file.linshareDocument);
          });
        }
      }
    }

    /**
     * @name areAllSameType
     * @desc Check if all nodes has the same type
     * @param {string} [nodeType] - Type which all nodes should be
     * @param {Array<Object>} [nodesList] - List to check
     * @returns {boolean} True if all elements have the same type
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function areAllSameType(nodeType, nodesList) {
      var _nodeType = nodeType || TYPE_DOCUMENT;
      var _nodesList = nodesList || workgroupNodesVm.selectedDocuments;
      return _.every(_nodesList, {'type': _nodeType});
    }

    /**
     * @name copyNode
     * @desc Copy a file from existing list
     * @param {Array<Object>} nodeItems - Nodes to copy
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function copyNode(nodeItems) {
      var promises = [];
      _.forEach(nodeItems, function(nodeItem) {
        promises.push(workgroupNodesRestService.copy(workgroupNodesVm.folderDetails.workgroupUuid, nodeItem.uuid,
          workgroupNodesVm.folderDetails.folderUuid).then(function(newNode) {
          var restangularizedNode = workgroupNodesRestService.restangularize(newNode[0],
            workgroupNodesVm.folderDetails.workgroupUuid);
          restangularizedNode.fromServer = true;
          addNewItemInTableParams(restangularizedNode);
        }));
      });

      $q.all(promises).then(function(nodeItems) {
        notifyCopySuccess(nodeItems.length);
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26444 :
            toastService.error({key: 'TOAST_ALERT.ERROR.COPY.26444'});
            break;
        }
      });
    }

    /**
     * @name copyNodeToPersonalSpace
     * @desc Copy documents from current list into Personal Space
     * @param {Array<Object>} nodeItems - Nodes to copy
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function copyNodeToPersonalSpace(nodeItems) {
      var promises = [];
      _.forEach(nodeItems, function(nodeItem) {
        promises.push(workgroupNodesRestService.copyToMySpace(workgroupNodesVm.folderDetails.workgroupUuid,
          nodeItem.uuid));
      });

      $q.all(promises).then(function(nodeItems) {
        notifyCopySuccess(nodeItems.length);
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26444 :
            toastService.error({key: 'TOAST_ALERT.ERROR.COPY.26444'});
            break;
        }
      });
    }

    /**
     * @name createFolder
     * @desc Create a folder
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function createFolder() {
      if (workgroupNodesVm.canCreateFolder) {
        workgroupNodesVm.paramFilter.name = '';
        filterBoxService.setFilters(false);
        var newFolderObject = workgroupNodesRestService.restangularize({
          name: newFolderName,
          parent: workgroupNodesVm.folderDetails.folderUuid,
          type: TYPE_FOLDER
        }, workgroupNodesVm.folderDetails.workgroupUuid);
        workgroupNodesRestService.create(workgroupNodesVm.folderDetails.workgroupUuid, newFolderObject, true)
          .then(function(data) {
            newFolderObject.name = data.name;
            newFolderObject.parent = data.parent;
            newFolderObject.type = data.type;
            workgroupNodesVm.canCreateFolder = false;
            workgroupNodesVm.nodesList.push(newFolderObject);
            workgroupNodesVm.tableParamsService.reloadTableParams();
            $timeout(function() {
              renameNode(newFolderObject, 'td[uuid=""] .file-name-disp');
            }, 0);
          });
      }
    }

    /**
     * @name deleteNodes
     * @desc Delete nodes
     * @param {Array<Object>} nodes - List of nodes to delete
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function deleteNodes(nodes) {
      documentUtilsService.deleteItem(
        nodes,
        documentUtilsService.itemUtilsConstant.WORKGROUP_NODE,
        function(nodes) {
          doDeleteNodes(nodes).then(showNotifications);
        }
      );
    }

    /**
     * @name doDeleteNodes
     * @desc Delete nodes
     * @param {Array<Object>} nodes - List of nodes to be deleted
     * @returns {Object} deleted and nonDeleted items
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function doDeleteNodes(nodes) {
      return $q
        .allSettled(_.map(nodes, function(node) { return node.remove(); }))
        .then(function(removeNodesValues) {
          var deletedNodes = getFulfilledValues(removeNodesValues);
          var nonDeletedNodes = getRejectedReasons(removeNodesValues);

          _.remove(workgroupNodesVm.nodesList, function(node) {
            return isDocumentContainedInCollection(deletedNodes, node);
          });
          _.remove(workgroupNodesVm.selectedDocuments, function(selectedDocument) {
            return isDocumentContainedInCollection(deletedNodes, selectedDocument);
          });

          workgroupNodesVm.tableParamsService.reloadTableParams();
          $scope.mainVm.sidebar.hide(nodes);

          return {
            deletedNodes: deletedNodes,
            nonDeletedNodes: nonDeletedNodes
          };
        });
    }

    /**
     * @name showNotifications
     * @desc give user feedback about deleted nodes
     * @param {Array<Object>} deleteNodesResponse - List of answers sent by the server about each deleted node
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showNotifications(deleteNodesResponse) {
      if (deleteNodesResponse.nonDeletedNodes.length > 0) {
        showErrorNotificationForNonDeletedNodes(deleteNodesResponse.nonDeletedNodes);
      } else {
        showSuccessNotificationForDeletedNodes(deleteNodesResponse.deletedNodes);
      }
    }

    /**
     * @name isDocumentContainedInCollection
     * @desc Detect if the document is contained in the collection by leveraging its uuid
     * @param {Array<Object>} collection - List of document object
     * @param {Object} document - A document object
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function isDocumentContainedInCollection(collection, document) {
      var indexOfDocumentInCollection = _.findIndex(collection, function(collectionItem) {
        return collectionItem.uuid === document.uuid;
      });

      return indexOfDocumentInCollection !== -1;
    }

    /**
     * @name getFulfilledValues
     * @desc Get deleted nodes
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted node
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
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
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted node
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
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
     * @name showSuccessNotificationForDeletedNodes
     * @desc Show success notification about deleted nodes
     * @param {Array<Object>} deletedNodes - List of deleted nodes
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showSuccessNotificationForDeletedNodes(deletedNodes) {
      var message = (deletedNodes.length === 1) ?
        'TOAST_ALERT.ACTION.DELETE_SINGULAR' :
        'TOAST_ALERT.ACTION.DELETE_PLURAL';

      toastService.success({ key: message });
    }

    /**
     * @name showErrorNotificationForNonDeletedNodes
     * @desc Show error notification about non-deleted nodes
     * @param {Array<Object>} nonDeletedNodes - List of non-deleted nodes
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showErrorNotificationForNonDeletedNodes(nonDeletedNodes) {
      _.forEach(nonDeletedNodes, function(nonDeletedItem) {
        if (nonDeletedItem.status === 400 && nonDeletedItem.data.errCode === 26006) {
          toastService.error({ key: 'TOAST_ALERT.ERROR.DELETE_ERROR.26006' });
        } else if (nonDeletedItem.data.errCode === 26444) {
          toastService.error({ key: 'TOAST_ALERT.ERROR.DELETE_ERROR.26444' });
        }
      });
    }

    /**
     * @name downloadFile
     * @desc Download a file
     * @param {Object} fileDocument - File to download's document
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function downloadFile(fileDocument) {
      var url = workgroupNodesRestService.download(workgroupNodesVm.folderDetails.workgroupUuid, fileDocument.uuid);
      documentUtilsService.download(url, fileDocument.name);
    }

    /**
     * @name downloadSelectedFiles
     * @desc Download selected files
     * @param {Array<Object>} selectedDocuments - List of selected files
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function downloadSelectedFiles(selectedDocuments) {
      _.forEach(selectedDocuments, function(document) {
        workgroupNodesVm.downloadFile(document);
      });
    }

    /**
     * @name getBreadcrumb
     * @desc Generate breadcrumb object for view
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function getBreadcrumb() {
      workgroupNodesVm.breadcrumb = workgroupNodesVm.currentFolder.treePath || [];
      workgroupNodesVm.breadcrumb.shift();
      if (workgroupNodesVm.currentFolder.parent !== workgroupNodesVm.currentFolder.workGroup) {
        workgroupNodesVm.breadcrumb.push({
          name: workgroupNodesVm.currentFolder.name,
          uuid: workgroupNodesVm.currentFolder.uuid
        });
      }
    }

    /**
     * @name getNodeDetails
     * @desc Get node details and thumbnail if exists
     * @param {Object} nodeItem - A node object
     * @returns {Promise} Node object with details
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function getNodeDetails(nodeItem) {
      // TODO : change the watcher method in activate() of workgroupMembersController, then do it better
      $scope.mainVm.sidebar.setContent(workgroupNodesVm.workgroupNode);

      return $q
        .all([
          workgroupNodesRestService.get(
            workgroupNodesVm.folderDetails.workgroupUuid,
            nodeItem.uuid
          ),
          workgroupNodesRestService.getAudit(
            workgroupNodesVm.folderDetails.workgroupUuid,
            nodeItem.uuid
          )
        ])
        .then(function(workgroupNodesRestServiceAnswers) {
          var nodeDetails = workgroupNodesRestServiceAnswers[0];
          var nodeAudit = workgroupNodesRestServiceAnswers[1];

          return $q.all([
            documentUtilsService.loadItemThumbnail(
              nodeDetails,
              workgroupNodesRestService.thumbnail.bind(
                null,
                workgroupNodesVm.folderDetails.workgroupUuid,
                nodeItem.uuid
              )
            ),
            auditDetailsService.generateAllDetails(
              $scope.userLogged.uuid,
              nodeAudit.plain()
            ),
          ]);
        })
        .then(function(workgroupNodesRestServiceAnswers) {
          var nodeDetails = workgroupNodesRestServiceAnswers[0];
          var auditActions = workgroupNodesRestServiceAnswers[1];

          return Object.assign(
            {},
            nodeDetails,
            { auditActions: auditActions }
          );
        });
    }

    /**
     * @name getWorkgroupMemberDetails
     * @desc Get current workgroup details
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function getWorkgroupMemberDetails() {
      workgroupMembersRestService.get(workgroupNodesVm.folderDetails.workgroupUuid, $scope.userLogged.uuid)
        .then(function(member) {
          workgroupNodesVm.currentWorkgroupMember = member;

          setCurrentWorkgroupUserRights(workgroupNodesVm.currentWorkgroupMember);
          workgroupNodesVm.fabButton.actions.push({
            action: null,
            flowDirectory: true,
            hide: !workgroupNodesVm.permissions.FOLDER.CREATE,
            icon: 'groups-upload-file',
            label: 'WORKGROUPS_LIST.UPLOAD_FOLDER'
          },{
            action: null,
            flowBtn: true,
            hide: !workgroupNodesVm.permissions.FILE.CREATE,
            icon: 'ls-upload-fill',
            label: 'ADD_FILES_DROPDOWN.UPLOAD_FILE'
            }
          );
        });

      /**
       * @name setCurrentWorkgroupUserRights
       * @desc Set rights of the current workroup user
       * @param {object} currentWorkgroupMember - Current workgroup member
       * @memberOf LinShare.sharedSpace.WorkgroupNodesController
       */
      function setCurrentWorkgroupUserRights(currentWorkgroupMember) {
        workgroupNodesVm.writeAndReadonlyMembers = !currentWorkgroupMember.admin && lsAppConfig.hideOnNonAdmin;

        workgroupNodesVm.readonlyMember = currentWorkgroupMember.readonly && lsAppConfig.hideOnReadOnly;
      }

    }

    /**
     * @name goToFolder
     * @desc Enter inside a folder
     * @param {object} folder - Folder where to enter
     * @param {boolean} [forceEnter] - Force entering
     * @param {string} [selectFileUuid] - Uuid of file to put in selected mode
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function goToFolder(folder, forceEnter, selectFileUuid) {
      var folderNameElem;
      var folderDetails = {
        workgroupUuid: workgroupNodesVm.folderDetails.workgroupUuid,
        workgroupName: workgroupNodesVm.folderDetails.workgroupName.trim(),
        uploadedFileUuid: selectFileUuid
      };
      var isNotInEditMode = true;
      var canEnter = true;
      var routeStateSuffix = 'root';

      if(!_.isNil(folder)) {
        canEnter = !workgroupNodesVm.isDocument(folder.type);
        if (!forceEnter) {
          folderNameElem = $('td[uuid=' + folder.uuid + ']').find('.file-name-disp');
          isNotInEditMode = (angular.element(folderNameElem).attr('contenteditable') === 'false');
        }
        folderDetails = {
          workgroupUuid: folder.workgroupUuid || workgroupNodesVm.folderDetails.workgroupUuid,
          workgroupName: folder.workgroupName || workgroupNodesVm.folderDetails.workgroupName.trim(),
          parentUuid: folder.parent,
          folderUuid: folder.uuid,
          folderName: folder.name.trim(),
          uploadedFileUuid: selectFileUuid
        };
        routeStateSuffix = folderDetails.parentUuid !== folderDetails.workgroupUuid ? 'folder' : 'root';
      }

      if (canEnter && isNotInEditMode) {
        $state.go('sharedspace.workgroups.' + routeStateSuffix, folderDetails);
      }
    }

    /**
     * @name goToPreviousFolder
     * @desc Enter inside the parent folder or Workgroups page if current folder is root
     * @param {boolean} goToWorkgroupPage - Go to Workgroups page
     * @param {object} folder - Folder where to enter
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function goToPreviousFolder(goToWorkgroupPage, folder) {
      if (goToWorkgroupPage) {
        $state.go('sharedspace.all');
      } else {
        workgroupNodesVm.goToFolder(folder, true);
      }
    }

    /**
     * @name isDocument
     * @desc Determine if the node type is a document
     * @param {string} nodeType - The type of the node
     * @returns {boolean} Is node a document or not
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function isDocument(nodeType) {
      return (nodeType === TYPE_DOCUMENT);
    }

    /**
     * @name launchTableParamsInitiation
     * @desc Initialize tableParams and related functions
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function launchTableParamsInitiation() {
      tableParamsService.initTableParams(workgroupNodesVm.nodesList, workgroupNodesVm.paramFilter,
          workgroupNodesVm.folderDetails.uploadedFileUuid)
        .then(function(data) {
          workgroupNodesVm.tableParamsService = tableParamsService;
          workgroupNodesVm.tableParams = tableParamsService.getTableParams();
          workgroupNodesVm.lengthOfSelectedDocuments = tableParamsService.lengthOfSelectedDocuments;
          workgroupNodesVm.resetSelectedDocuments = tableParamsService.resetSelectedItems;
          workgroupNodesVm.selectedDocuments = tableParamsService.getSelectedItemsList();
          workgroupNodesVm.selectDocumentsOnCurrentPage = function(data, page, selectFlag){
            tableParamsService.tableSelectAll(data, page, selectFlag);
            workgroupNodesVm.canDeleteNodes = $filter('canDeleteNodes')(
              workgroupNodesVm.selectedDocuments,
              workgroupNodesVm.permissions
            );
          };
          workgroupNodesVm.addSelectedDocument = function(item) {
            tableParamsService.toggleItemSelection(item);
            workgroupNodesVm.canDeleteNodes = $filter('canDeleteNodes')(
              workgroupNodesVm.selectedDocuments,
              workgroupNodesVm.permissions
            );
          };
          workgroupNodesVm.sortDropdownSetActive = tableParamsService.tableSort;
          workgroupNodesVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
          workgroupNodesVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
          workgroupNodesVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();

          if (!_.isNil(data.itemToSelect)) {
            workgroupNodesVm.showSelectedNodeDetails(data.itemToSelect);
          }
        });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {string} content - The id of the content to load, see app/views/includes/sidebar-right.html
     * for possible values
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    // TODO : service with content and vm as parameter (because these 3 line are always same in all controller...)
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(workgroupNodesVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    /**
     * @name  multiDownload
     * @desc Trigger multiple download of items with a confirm dialog if needed
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function multiDownload() {
      documentUtilsService
        .canShowMultipleDownloadConfirmationDialog(workgroupNodesVm.selectedDocuments).then(function() {
          downloadSelectedFiles(workgroupNodesVm.selectedDocuments);
        });
    }

    /**
     * @name openBrowser
     * @desc Open browser of folders to copy/move a node
     * @param {Array<Object>} nodeItems - Nodes to copy/move
     * @param {boolean} isMove - Check if it is a copy/move
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function openBrowser(nodeItems, isMove) {
      var currentFolder = null;

      if(workgroupPermissions.FOLDER.CREATE) {
        currentFolder = _.cloneDeep(workgroupNodesVm.currentFolder);
      }

      browseService.show({
        currentFolder: currentFolder,
        currentList: _.orderBy(
          _.filter(
            workgroupNodesVm.nodesList,
            {'type': TYPE_FOLDER}
          ),
          'modificationDate',
          'desc'
        ),
        nodeItems: nodeItems,
        isMove: isMove,
        hasFolder:  _.some(nodeItems, {'type': TYPE_FOLDER}),
        hasFile:  _.some(nodeItems, {'type': TYPE_DOCUMENT}),
        restService: workgroupNodesRestService
      }).then(function(data) {
        openBrowserNotify(data, isMove);
      }).finally(function() {
        reloadTableParamsDatas();
      });
    }

    /**
     * @name openBrowserNotify
     * @desc Check result of browser close and notify it
     * @param {object} data - mdDialog's close datas
     * @param {boolean} isMove - Check if it is a copy/move
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function openBrowserNotify(data, isMove) {
      if (!isMove && data.folder.uuid === workgroupNodesVm.currentFolder.uuid) {
        notifyCopySuccess(data.nodeItems.length);
      } else if (data.failedNodes.length) {
        notifyBrowseActionError(data, isMove);
      } else {
        notifyBrowseActionSuccess(data, isMove);
      }
    }

    /**
     * @name notifyBrowseActionError
     * @desc Notify when an error occurred on copy/move nodes
     * @param {object} data - mdDialog's close datas
     * @param {boolean} isMove - Check if it is a copy/move
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function notifyBrowseActionError(data, isMove) {
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
          action: isMove ? 'moved' : '',
          nbNodes: data.failedNodes.length,
          singular: data.failedNodes.length === 1 ? 'true' : ''
        }
      }, undefined, responses.length ? responses : undefined);
    }

    /**
     * @name notifyBrowseActionSuccess
     * @desc Notify success on copy/move nodes
     * @param {object} data - mdDialog's close datas
     * @param {boolean} isMove - Check if it is a copy/move
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function notifyBrowseActionSuccess(data, isMove) {
      toastService.success({
        key: 'TOAST_ALERT.ACTION.BROWSER_ACTION',
        pluralization: true,
        params: {
          singular: data.nodeItems.length <= 1 ? 'true' : '',
          action: isMove ? 'moved' : '',
          folderName: data.folder.name
        }
      }, 'TOAST_ALERT.ACTION_BUTTON').then(function(response) {
        if (!_.isUndefined(response)) {
          if (response.actionClicked) {
            var nodeToSelectUuid = data.nodeItems.length === 1 ? data.nodeItems[0].uuid : null;
            workgroupNodesVm.goToFolder(data.folder, true, nodeToSelectUuid);
          }
        }
      });
    }

    /**
     * @name notifyCopySuccess
     * @desc Notify success on simple copy nodes
     * @param {number} nbNodes - Number of nodes simple copy success
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function notifyCopySuccess(nbNodes) {
      toastService.success({
        key: 'TOAST_ALERT.ACTION.COPY_SAME_FOLDER',
        pluralization: true,
        params: {singular: nbNodes === 1 ? 'true' : ''}
      });
    }

    /**
     * @name reloadTableParamsDatas
     * @desc Get all nodes from back and refresh tableParams
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function reloadTableParamsDatas() {
      workgroupNodesRestService.getList(workgroupNodesVm.currentFolder.workGroup, workgroupNodesVm.currentFolder.uuid)
        .then(function(nodeItems) {
          workgroupNodesVm.nodesList = nodeItems;
          workgroupNodesVm.resetSelectedDocuments();
          tableParamsService.reloadTableParams(workgroupNodesVm.nodesList);
        });
    }

    /**
     * @name renameNode
     * @desc Rename node name
     * @param {object} nodeToRename - Node to rename
     * @param {string} itemNameElem - Name of the item in view which is in edition mode
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function renameNode(nodeToRename, itemNameElem) {
      itemNameElem = itemNameElem || 'td[uuid=' + nodeToRename.uuid + '] .file-name-disp';
      documentUtilsService.rename(nodeToRename, itemNameElem).then(function(data) {
        var changedNodePos = _.findIndex(workgroupNodesVm.nodesList, nodeToRename);
        workgroupNodesVm.nodesList[changedNodePos] = data;
        if (nodeToRename.name !== data.name) {
          $timeout(function() {
            renameNode(data, 'td[uuid=' + data.uuid + '] .file-name-disp');
            toastService.error({key: 'TOAST_ALERT.ERROR.RENAME_NODE'});
          }, 0);
        } else {
          workgroupNodesVm.canCreateFolder = true;
        }
      }).catch(function(error) {
        switch(error.data.errCode) {
          case 26445 :
          case 28005 :
            toastService.error({key: 'TOAST_ALERT.ERROR.RENAME_NODE'});
            renameNode(nodeToRename, itemNameElem);
            break;
          case lsErrorCode.CANCELLED_BY_USER:
            if (!nodeToRename.uuid) {
              workgroupNodesVm.nodesList.splice(_.findIndex(workgroupNodesVm.nodesList, nodeToRename), 1);
            }
            workgroupNodesVm.canCreateFolder = true;
            break;
        }
      }).finally(function() {
        workgroupNodesVm.tableParamsService.reloadTableParams();
      });
    }

    /**
     * @name setFabConfig
     * @desc Build the floating actions button
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function setFabConfig() {
      workgroupNodesVm.fabButton = {
        toolbar: {
          activate: true,
          label: 'BOUTON_ADD_FILE_TITLE'
        },
        actions: [{
          action: function() {
            return workgroupNodesVm.showWorkgroupDetails(true);
          },
          label: 'ACTION.ADD_MEMBER',
          icon: 'ls-add-user',
          hide: !workgroupNodesVm.permissions.MEMBER.CREATE,
        }, {
          action: function() {
            return workgroupNodesVm.createFolder();
          },
          label: 'WORKGROUPS_LIST.FOLDER',
          icon: 'ls-folder',
          hide: !workgroupNodesVm.permissions.FOLDER.CREATE,
        }]
      };
    }

    /**
     * @name showSelectedNodeDetails
     * @desc Get information from a node and show them in the right sidebar
     * @param {Object} selectedNode - A Document node object
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showSelectedNodeDetails(selectedNode) {
      workgroupNodesVm.getNodeDetails(selectedNode).then(function(data) {
        workgroupNodesVm.currentSelectedDocument.current = data;
        workgroupNodesVm.mdtabsSelection.selectedIndex = 0;
        workgroupNodesVm.loadSidebarContent(workgroupNodesVm.workgroupNode);
        workgroupNodesVm.currentSelectedDocument.membersForContactsList = _.map(
          workgroup.members,
          function(member) {
            return { mail: member.account.mail };
          }
        );
      });
    }

    /**
     * @name showWorkgroupDetails
     * @desc Get current workgroup details
     * @param {boolean} [showMemberTab] - Show add member tab
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function showWorkgroupDetails(showMemberTab) {
      workgroupRestService.get(workgroupNodesVm.folderDetails.workgroupUuid, true).then(function(workgroup) {
        // TODO : remove the map once the property userMail will be changed to mail
        workgroupNodesVm.currentSelectedDocument.membersForContactsList = _.map(
          workgroup.members,
          function(member) {
            return { mail: member.userMail };
          }
        );
        workgroupNodesVm.currentSelectedDocument.current = workgroup;
        return workgroup;
      }).then(function() {
        return $q.all([
          workgroupRestService.getQuota(workgroupNodesVm.currentSelectedDocument.current.quotaUuid),
          workgroupRestService.getAudit(workgroupNodesVm.folderDetails.workgroupUuid)
        ]);
      }).then(function(promises) {
        workgroupNodesVm.currentSelectedDocument.current.quotas = promises[0];
        return auditDetailsService.generateAllDetails($scope.userLogged.uuid, promises[1].plain());
      }).then(function(auditActions) {
        workgroupNodesVm.currentSelectedDocument.current.auditActions = auditActions;
        workgroupNodesVm.mdtabsSelection.selectedIndex = showMemberTab ? 1 : 0;
        workgroupNodesVm.loadSidebarContent(workgroupNodesVm.workgroupPage);
      });
    }

    /**
     * @name upload
     * @desc Manage upload of document and folder
     * Folder upload: when a folder is in error (creation or retrieve), the associated file(s)
     * and related children folder file(s) are canceled and shown to the user by the toastService error
     * @param {Array<Object>} flowFiles - List of files to upload
     * @param {string} from - Destination of upload
     * @param {string} folderDetails - Folder details
     * @memberOf LinShare.sharedSpace.WorkgroupNodesController
     */
    function upload(flowFiles, from, folderDetails) {
      var
        promises = {
          folders: []
        },
        filesError = [],
        foldersObj = {},
        foldersTree = {},
        foldersTreeError = {},
        filesToUpload = [];

      _.forEachRight(flowFiles, function(file) {
        file._from = from;

        if (file.relativePath !== file.name &&
            workgroupNodesVm.permissions.FOLDER.CREATE) {
           foldersObj = treeFolderBuilder(file, folderDetails, foldersTree);

          _.assign(foldersTree, foldersObj.tree);

          promises.folders = _.concat(promises.folders, foldersObj.promises);

          if (workgroupNodesVm.permissions.FILE.CREATE) {
            filesToUpload.push(file);
          }
        }

        if (file.relativePath === file.name &&
            workgroupNodesVm.permissions.FILE.CREATE) {
          filesToUpload.push(file);
        }
      });

      $q.allSettled(promises.folders).then(function(promises) {
        foldersTreeError = handleUploadError(promises, foldersTree);
        _.forEach(filesToUpload, function(file) {
          if (file.relativePath === file.name) {
            file.folderDetails = folderDetails;
          } else {
            var filePath = _.trimEnd(file.relativePath, file.name).slice(0, -1);
            if (foldersTree[filePath] && _.isNil(foldersTreeError[filePath])) {
              file.folderDetails = {
                folderName: foldersTree[filePath].name,
                folderUuid: foldersTree[filePath].uuid,
                parentUuid: foldersTree[filePath].parent,
                uploadedFileUuid: null,
                workgroupName: folderDetails.workgroupName,
                workgroupUuid: folderDetails.workgroupUuid,
                quotaUuid: workgroupNodesVm.folderDetails.quotaUuid
              };
            } else {
              var
                /* Replace the uuid of the node by its name */
                nodeInError = /.{8}-.{4}-.{4}-.{4}-.{12}/g.exec(foldersTreeError[filePath].error.data.message)[0],
                message = {
                  key: 'SERVER_RESPONSE.DETAILS.DEFAULT.' + foldersTreeError[filePath].error.data.errCode,
                  params: {
                    folderName: nodeInError ? ' ' + _.find(foldersTree, {uuid: nodeInError}).name : ''
                  }
                };
              /* Create the array of error details for the toastService.error */
              filesError.push({title: file.name, message: message});
              file.cancel();
            }
          }
        });
      }).finally(function() {
        $scope.$flow.upload();
        workgroupNodesVm.tableParamsService.reloadTableParams();
        notifyErrors(filesError);
      });

      /**
       * @name handleUploadError
       * @desc Produce an object similar to foldersTree with path in error as attributes
       * @param {Array<Promise>} promises - List of workgroupNodesRestservice.(create || get) promise
       * @param {Object} foldersTree - Tree folder
       * @returns {Object} Tree folder in error
       * @memberOf LinShare.sharedSpace.WorkgroupNodesController.upload
       */
      function handleUploadError(promises, foldersTree) {
        var
          foldersTreeError = {},
          pathsError = [];

        _.forEach(promises, function(promise) {
          if (promise.state === 'rejected') {
            var
              node = promise.reason.node,
              parent = _.find(foldersTree, {'uuid': node.parent});
            pathsError.push({path: parent.name + '/'+ node.name, error: promise.reason});
          }
        });

        if (pathsError) {
          pathsError = _.uniqBy(pathsError, 'path');
          _.forEach(foldersTree, function(folder, path) {
            _.forEach(pathsError, function(pathError) {
              if (path.indexOf(pathError.path) > -1) {
                foldersTreeError[path] = pathError.error;
              }
            });
          });
        }
        return foldersTreeError;
      }

      /**
       * @name notifyErrors
       * @desc Show a toast error details with file in error and reason
       * @param {Object[]} [filesError] - List of files in error
       * @param {string} [filesError[].title] - Title of the error
       * @param {string} [filesError[].message] - Message of the error
       * @memberOf LinShare.sharedSpace.WorkgroupNodesController.upload
       */
      function notifyErrors(filesError) {
        if (filesError.length === 0) {
          return;
        }

        var message = {
          key: 'TOAST_ALERT.WARNING.ELEMENTS_NOT_UPLOADED',
          pluralization: true,
          params: {
            singular: filesError.length === 1,
            number: filesError.length
          }
        };
        toastService.error(message, undefined, filesError);
      }

      /**
       * @name treeFolderBuilder
       * @desc Create folder node tree of a given path
       * @param {Object} file - File to upload
       * @param {string} folderDetails - Folder details
       * @param {Object} [foldersTreeInit] - Initial tree folder
       * @returns {Object} foldersObj - Contains promises of node event and tree folder structure
       * @returns {Array<Promise>} foldersObj.promises - List of workgroupnodesrestservice.(create || get) promise
       * @returns {Object} foldersObj.tree - Tree folder structure of the file
       * @memberOf LinShare.sharedSpace.WorkgroupNodesController.upload
       */
      function treeFolderBuilder(file, folderDetails, foldersTreeInit) {
        var
          current,
          foldersTree = _.assign(foldersTree, foldersTreeInit),
          previous,
          promises = [],
          splitFilePath = file.relativePath.split('/').slice(0, -1);

        _.forEach(splitFilePath, function(folder, index) {
          previous = _.join(splitFilePath.slice(0, index), '/');
          current = previous ? previous + '/' + folder : folder;
          if (_.isNil(foldersTree[current])) {
            var newDir =  [];
            newDir.name = folder;
            newDir.type = TYPE_FOLDER;
            newDir._deferred = $q.defer();

            if (previous) {
              foldersTree[previous]._deferred.promise.then(function(node) {
                $q.when(_.find(foldersTree, {'uuid': node.uuid})).then(function(parent) {
                  if (parent.length === 0 && !parent._created) {
                    return workgroupNodesRestService.getList(folderDetails.workgroupUuid, parent.uuid)
                      .then(function(nodes) {
                        return _.assign(parent, nodes);
                      });
                  }
                  return parent;
                }).then(function(parent) {
                  newDir.parent = parent.uuid;
                  getNode(newDir, parent).then(function(nodeData) {
                    if (nodeData.error) {
                      newDir._deferred.reject(nodeData);
                    } else {
                      _.assign(newDir, nodeData);
                      newDir._deferred.resolve(nodeData);
                    }
                  });
                });
              }).catch(function(nodeError) {
                newDir._deferred.reject(nodeError);
              });
            } else {
              newDir.parent = folderDetails.folderUuid;
              getNode(newDir, workgroupNodesVm.nodesList).then(function(nodeData){
                if (nodeData.error) {
                  newDir._deferred.reject(nodeData);
                } else {
                  _.assign(newDir, nodeData);
                  newDir._deferred.resolve(nodeData);
                }
              });
            }
            promises.push(newDir._deferred.promise);
            foldersTree[current] = newDir;
          }
        });
        return {promises: promises, tree: foldersTree};

        ////////////

        /**
         * @name createNode
         * @desc Create a folder type Node
         * @param {Object} node - The node to create
         * @returns {Promise} Server response
         * @memberOf LinShare.sharedSpace.WorkgroupNodesController.upload.treeFolderBuilder
         */
        function createNode(node) {
          return workgroupNodesRestService
            .create(folderDetails.workgroupUuid, _.omit(node, ['_deferred'])).then(function(data) {
              data._created = true;
              return data;
            }).catch(function(error) {
              return {error: error, node: node};
            });
        }

        /**
         * @name getNode
         * @desc Get a folder type Node by retrieving it from parent or creating it
         * @param {Object} node - The node to get or create
         * @param {Object} parent - Parent node object
         * @returns {Promise} Server response
         * @memberOf LinShare.sharedSpace.WorkgroupNodesController.upload.treeFolderBuilder
         */
        function getNode(node, parent) {
          var promise;
          var nodeFound = _.find(parent, {
            'name': node.name
          }) || node;
          if (_.isNil(nodeFound.uuid)) {
            promise = createNode(node);
          } else {
            promise = $q.when(nodeFound);
          }

          return promise.then(function(nodeData) {
            if (nodeData._created) {
              parent.push(nodeData);
            }
            return nodeData;
          }).catch(function(error) {
            return {error: error, node: node};
          });
        }
      }
    }


    // TODO : directive for all functions below (check sidebar-content-details.html for input and textarea)
    workgroupNodesVm.toggleSearchState = toggleSearchState;

    function toggleSearchState() {
      if (!workgroupNodesVm.searchMobileDropdown) {
        angular.element('#drop-area').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      } else {
        angular.element('#drop-area').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      }
      workgroupNodesVm.searchMobileDropdown = !workgroupNodesVm.searchMobileDropdown;
    }
  }
})();
