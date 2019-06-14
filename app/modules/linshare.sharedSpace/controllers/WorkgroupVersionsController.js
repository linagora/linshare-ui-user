/**
 * WorkgroupVersionsController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('notification');
    }])
    .controller('WorkgroupVersionsController', WorkgroupVersionsController);

  WorkgroupVersionsController.$inject = [
    '_',
    '$filter',
    '$q',
    '$scope',
    '$state',
    '$transition$',
    'auditDetailsService',
    'browseService',
    'currentFolder',
    'documentPreviewService',
    'documentUtilsService',
    'flowUploadService',
    'lsAppConfig',
    'nodesList',
    'tableParamsService',
    'toastService',
    'user',
    'workgroup',
    'workgroupNodesRestService',
    'workgroupPermissions',
    'workgroupVersionsRestService'
  ];

  /**
   * @namespace WorkgroupVersionsController
   * @desc Application version management system controller
   * @memberOf LinShare.sharedSpace
   */
  function WorkgroupVersionsController(
    _,
    $filter,
    $q,
    $scope,
    $state,
    $transition$,
    auditDetailsService,
    browseService,
    currentFolder,
    documentPreviewService,
    documentUtilsService,
    flowUploadService,
    lsAppConfig,
    nodesList,
    tableParamsService,
    toastService,
    user,
    workgroup,
    workgroupNodesRestService,
    workgroupPermissions,
    workgroupVersionsRestService
  ) {
    var workgroupVersionsVm = this;
    const TYPE_VERSION = 'DOCUMENT_REVISION';
    const TYPE_DOCUMENT = 'DOCUMENT';
    const TYPE_FOLDER = 'FOLDER';

    workgroupVersionsVm.canCopyVersionToPersonalSpace = user.canUpload;
    workgroupVersionsVm.canDeleteNodes = false;
    workgroupVersionsVm.currentSelectedDocument = {};
    workgroupVersionsVm.folderDetails = _.cloneDeep($transition$.params());
    workgroupVersionsVm.currentFolder = currentFolder;
    workgroupVersionsVm.breadcrumb = [];
    workgroupVersionsVm.upload = upload;
    workgroupVersionsVm.versionsList = nodesList;
    workgroupVersionsVm.permissions = workgroupPermissions;
    workgroupVersionsVm.tableParamsService = tableParamsService;
    workgroupVersionsVm.flowUploadService = flowUploadService;
    workgroupVersionsVm.getNodeDetails = getNodeDetails;
    workgroupVersionsVm.addUploadedDocument = addUploadedDocument;
    workgroupVersionsVm.goToFolder = goToFolder;
    workgroupVersionsVm.openBrowser = openBrowser;
    workgroupVersionsVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    workgroupVersionsVm.addSelectedDocument = addSelectedDocument;
    workgroupVersionsVm.showFileDetails = showFileDetails;
    workgroupVersionsVm.loadSidebarContent = loadSidebarContent;
    workgroupVersionsVm.workgroupNode = lsAppConfig.workgroupNode;
    workgroupVersionsVm.deleteVersions = deleteVersions;
    workgroupVersionsVm.downloadVersion = downloadVersion;
    workgroupVersionsVm.downloadMultiVersions = downloadMultiVersions;
    workgroupVersionsVm.restore = restore;
    workgroupVersionsVm.showSelectedVersionDetails = showSelectedVersionDetails;
    workgroupVersionsVm.copyVersionToPersonalSpace = copyVersionToPersonalSpace;

    activate();

    function activate() {

      workgroupVersionsVm.folderDetails.workgroupName = workgroup.name;
      workgroupVersionsVm.folderDetails.folderName = currentFolder.name;
      workgroupVersionsVm.folderDetails.folderUuid = currentFolder.uuid;
      workgroupVersionsVm.folderDetails.quotaUuid = workgroup.quotaUuid;
      workgroupVersionsVm.folderDetails.isversioningParameters = workgroup.versioningParameters.enable;

      Object.assign(
        documentPreviewService,
        {
          download: downloadVersion,
          copyToMySpace: function(item) {
            copyVersionToPersonalSpace([item]);
          },
          copyToWorkgroup: function(item) {
            openBrowser([item]);
          },
          showItemDetails: function(item) {
            showSelectedVersionDetails(item);
          }
        }
      );

      launchTableParamsInit();
      getBreadcrumb();
      setFabConfig();
    }

    /**
     * @name setFabConfig
     * @desc Build the floating actions button
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function setFabConfig() {
      workgroupVersionsVm.fabButton = {
        actions: [{
          flowBtn: true,
          hide: !workgroupVersionsVm.permissions.FILE.CREATE,
          icon: 'zmdi zmdi-plus',
          label: 'ADD_FILES_DROPDOWN.UPLOAD_FILE'
        }]
      };
    }

    function launchTableParamsInit() {
      tableParamsService.initTableParams(workgroupVersionsVm.versionsList, {},
        workgroupVersionsVm.folderDetails.uploadedFileUuid)
        .then(function() {
          workgroupVersionsVm.tableParamsService = tableParamsService;
          workgroupVersionsVm.tableParams = tableParamsService.getTableParams();
          workgroupVersionsVm.resetSelectedDocuments = tableParamsService.resetSelectedItems;
          workgroupVersionsVm.selectedDocuments = tableParamsService.getSelectedItemsList();
          workgroupVersionsVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
          workgroupVersionsVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
          workgroupVersionsVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
        });
    }

    /**
     * @name refreshTable
     * @desc Refresh version list from api and reload table
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function refreshTable() {
      return workgroupNodesRestService
        .getList(workgroupVersionsVm.folderDetails.workgroupUuid, workgroupVersionsVm.folderDetails.folderUuid)
        .then(function(versions) {
          workgroupVersionsVm.versionsList = versions;
          workgroupVersionsVm.tableParamsService.reloadTableParams(versions);
        });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {string} content - The id of the content to load, see app/views/includes/sidebar-right.html
     * for possible values
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    // TODO : service with content and vm as parameter (because these 3 line are always same in all controller...)
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(workgroupVersionsVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    // TODO: Define Version type
    /**
     * @name addSelectedDocument
     * @desc Select given document
     * @param {Version} item - {@link Version} object
     * @param {Number} page - Number of the page shown
     * @param {Boolean} selectFlag - Value to set document as selected or not, default toggle current selection value
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function addSelectedDocument(item) {
      tableParamsService.toggleItemSelection(item);
      workgroupVersionsVm.canDeleteNodes = $filter('canDeleteNodes')(
        workgroupVersionsVm.selectedDocuments,
        workgroupVersionsVm.permissions
      );
    };

    // TODO: Define Version type
    /**
     * @name selectDocumentOnCurrentPage
     * @desc Select document of the current table page shown
     * @param {Array<Version>} data - List of document version to select/unselect
     * @param {Number} page - Number of the page shown
     * @param {Boolean} selectFlag - Value to set document as selected or not, default toggle current selection value
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function selectDocumentsOnCurrentPage(data, page, selectFlag){
      tableParamsService.tableSelectAll(data, page, selectFlag);
      workgroupVersionsVm.canDeleteNodes = $filter('canDeleteNodes')(
        workgroupVersionsVm.selectedDocuments,
        workgroupVersionsVm.permissions
      );
    };

    /**
     * @name showFileDetails
     * @desc Get current file details
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function showFileDetails() {
      const workgroupUuid = workgroupVersionsVm.folderDetails.workgroupUuid;
      const nodeUuid = workgroupVersionsVm.folderDetails.folderUuid;

      $q
        .all([
          workgroupNodesRestService.get(workgroupUuid, nodeUuid),
          workgroupNodesRestService.getAudit(workgroupUuid, nodeUuid)
        ])
        .then(function(promises) {
          const nodeDetails = promises[0];
          const nodeAudit = promises[1];

          return $q.all([
            documentUtilsService.loadItemThumbnail(
              nodeDetails,
              workgroupNodesRestService.thumbnail.bind(
                null,
                workgroupUuid,
                nodeUuid
              )
            ),
            auditDetailsService.generateAllDetails($scope.userLogged.uuid, nodeAudit.plain()),
            $q.when(nodeDetails)
          ]);
        })
        .then(function(promises) {
          const nodeThumbnail = promises[0];
          const auditActions = promises[1];
          const nodeDetails = promises[2];

          workgroupVersionsVm.currentSelectedDocument.current = Object.assign(
            {},
            nodeDetails,
            nodeThumbnail,
            { auditActions: auditActions }
          );
          workgroupVersionsVm.loadSidebarContent(workgroupVersionsVm.workgroupNode);
        });
    }

    function getNodeDetails(nodeItem) {
      // TODO : change the watcher method in activate() of workgroupMembersController, then do it better
      $scope.mainVm.sidebar.setContent(workgroupVersionsVm.workgroupNode);

      return $q
        .all([
          workgroupVersionsRestService.get(
            workgroupVersionsVm.folderDetails.workgroupUuid,
            nodeItem.uuid
          ),
          workgroupVersionsRestService.getAudit(
            workgroupVersionsVm.folderDetails.workgroupUuid,
            nodeItem.uuid
          )
        ])
        .then(function(workgroupVersionsRestServiceAnswers) {
          var nodeDetails = workgroupVersionsRestServiceAnswers[0];
          var nodeAudit = workgroupVersionsRestServiceAnswers[1];

          return $q.all([
            documentUtilsService.loadItemThumbnail(
              nodeDetails,
              workgroupVersionsRestService.thumbnail.bind(
                null,
                workgroupVersionsVm.folderDetails.workgroupUuid,
                nodeItem.uuid
              )
            ),
            auditDetailsService.generateAllDetails(
              $scope.userLogged.uuid,
              nodeAudit.plain()
            ),
          ]);
        })
        .then(function(workgroupVersionsRestServiceAnswers) {
          var nodeDetails = workgroupVersionsRestServiceAnswers[0];
          var auditActions = workgroupVersionsRestServiceAnswers[1];

          return Object.assign(
            {},
            nodeDetails,
            { auditActions: auditActions }
          );
        });
    }

    function addNewItemInTableParams(newItem) {
      workgroupVersionsVm.versionsList.push(newItem);
      refreshTable();
    }

    function addUploadedDocument(flowFile) {
      if (flowFile.folderDetails.workgroupUuid === workgroupVersionsVm.folderDetails.workgroupUuid &&
        flowFile.folderDetails.folderUuid === workgroupVersionsVm.folderDetails.folderUuid) {
        flowFile.asyncUploadDeferred.promise.then(function(file) {
          file.linshareDocument.type === TYPE_VERSION && addNewItemInTableParams(file.linshareDocument);
        });
      }
    }

    /**
     * @name openBrowser
     * @desc Open browser of folders to copy a version
     * @param {Array<Object>} nodeItems - Nodes to copy/move
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function openBrowser(nodeItems) {
      browseService.show({
        currentList: [],
        nodeItems: nodeItems,
        hasFolder:  _.some(nodeItems, {'type': TYPE_FOLDER}),
        hasFile:  _.some(nodeItems, {'type': TYPE_DOCUMENT}),
        restService: workgroupNodesRestService
      }).then(function(data) {
        openBrowserNotify(data);
      }).finally(function() {
        workgroupVersionsVm.tableParamsService.reloadTableParams();
      });
    }

    /**
     * @name openBrowserNotify
     * @desc Check result of browser close and notify it
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function openBrowserNotify(data) {
      if (data.folder.uuid === workgroupVersionsVm.currentFolder.uuid) {
        notifyCopySuccess(data.nodeItems.length);
      } else if (data.failedNodes.length) {
        notifyBrowseActionError(data);
      } else {
        notifyBrowseActionSuccess(data);
      }
    }

    // TODO Add mdDialog's close data type definition
    /**
     * @name notifyBrowseActionError
     * @desc Notify when an error occurred on node copy
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
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
          nbNodes: data.failedNodes.length,
          singular: data.failedNodes.length === 1 ? 'true' : ''
        }
      }, undefined, responses.length ? responses : undefined);
    }

    /**
     * @name notifyBrowseActionSuccess
     * @desc Notify success on node copy
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function notifyBrowseActionSuccess(data) {
      toastService.success({
        key: 'TOAST_ALERT.ACTION.BROWSER_ACTION',
        pluralization: true,
        params: {
          singular: data.nodeItems.length <= 1 ? 'true' : '',
          folderName: data.folder.name
        }
      }, 'TOAST_ALERT.ACTION_BUTTON').then(function(response) {
        if (!_.isUndefined(response)) {
          if (response.actionClicked) {
            var nodeToSelectUuid = data.nodeItems.length === 1 ? data.nodeItems[0].uuid : null;

            workgroupVersionsVm.goToFolder(data.folder, true, nodeToSelectUuid);
          }
        }
      });
    }

    /**
     * @name notifyCopySuccess
     * @desc Notify success on simple node copy
     * @param {number} nbNodes - Number of nodes simple copy success
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function notifyCopySuccess(nbNodes) {
      toastService.success({
        key: 'TOAST_ALERT.ACTION.COPY_SAME_FOLDER',
        pluralization: true,
        params: {singular: nbNodes === 1 ? 'true' : ''}
      });
    }

    function upload(flowFiles, folderDetails) {
      _.forEachRight(flowFiles, function(file) {
        file.folderDetails = folderDetails;
      });

      $scope.$flow.upload();
      workgroupVersionsVm.tableParamsService.reloadTableParams();
    }

    /**
     * @name getBreadcrumb
     * @desc Generate breadcrumb object for revesion file view
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function getBreadcrumb() {
      workgroupVersionsVm.breadcrumb = workgroupVersionsVm.currentFolder.treePath || [];
      workgroupVersionsVm.breadcrumb.shift();
      workgroupVersionsVm.breadcrumb.push({
        name : workgroupVersionsVm.currentFolder.name,
        uuid: workgroupVersionsVm.currentFolder.uuid
      })
    }

    /**
     * @name goToFolder
     * @desc Enter inside a folder
     * @param {object} folder - Folder where to enter
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function goToFolder(folder) {
      var folderDetails = {
        workgroupUuid: workgroupVersionsVm.folderDetails.workgroupUuid,
        workgroupName: workgroupVersionsVm.folderDetails.workgroupName.trim()
      };
      var routeStateSuffix = 'root';

      if(!_.isNil(folder)) {
        folderDetails = {
          workgroupUuid: folder.workgroupUuid || workgroupVersionsVm.folderDetails.workgroupUuid,
          workgroupName: folder.workgroupName || workgroupVersionsVm.folderDetails.workgroupName.trim(),
          parentUuid: folder.parent,
          folderUuid: folder.uuid,
          folderName: folder.name.trim()
        };
        routeStateSuffix = folderDetails.parentUuid !== folderDetails.workgroupUuid ? 'folder' : 'root';
      }
        $state.go('sharedspace.workgroups.' + routeStateSuffix, folderDetails);
    }

    /**
     * @name deleteVersions
     * @desc Delete versions and notify the user
     * @param {Array<Version>} versions - List of versions to delete - {@link Version} object
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function deleteVersions(versions) {
      var messageKey = documentUtilsService.itemUtilsConstant.WORKGROUP_VERSION;
      var isLastVersion = false;

      if(workgroupVersionsVm.versionsList.length === versions.length) {
        isLastVersion = true;
        messageKey = versions.length === 1
        ? documentUtilsService.itemUtilsConstant.WORKGROUP_VERSION_LAST
        : documentUtilsService.itemUtilsConstant.WORKGROUP_VERSION_ALL;
      }

      documentUtilsService.deleteItem(
        versions,
        messageKey,
        function(versions) {
          doDeleteVersion(versions, isLastVersion).then(function(deleteVersionsResponse){
            showNotifications(deleteVersionsResponse);
            refreshTable();
          });
        });
    }

    // TODO Add a service for delete nodes to avoid the huge duplication in versions and nodes controller
    /**
     * @name doDeleteVersion
     * @desc Delete versions
     * @param {Array<Version>} versions - List of versions to delete - {@link Version} object
     * @param {boolean} isLastVersion - Determine if the version is the last one that exists
     * @returns {Object} deleted and nonDeleted versions
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function doDeleteVersion(versions, isLastVersion) {
      var removedVersions = [];

      if(isLastVersion) {
        removedVersions.push(workgroupVersionsRestService.remove(versions[0].workGroup, versions[0].parent));
      } else {
        removedVersions = _.map(versions, function(version) {
          delete version.versionNumber;
          delete version.isDifferentNameThanPrevious;
          return version.remove();
        });
      }

      return $q
        .allSettled(removedVersions)
        .then(function(removeVersionsValues) {
          var deletedVersions = getFulfilledValues(removeVersionsValues);
          var nonDeletedVersions = getRejectedReasons(removeVersionsValues);

          _.remove(workgroupVersionsVm.versionsList, function(version) {
            return isDocumentContainedInCollection(deletedVersions, version);
          });
          
          workgroupVersionsVm.resetSelectedDocuments();
          workgroupVersionsVm.tableParamsService.reloadTableParams();
          $scope.mainVm.sidebar.hide(versions);

          return {
            deletedVersions: deletedVersions,
            nonDeletedVersions: nonDeletedVersions,
            isLastVersiondeleted: isLastVersion
          };
        })
        .finally(function(deleteVersionsResponse) {
          isLastVersion && goToFolder(workgroupVersionsVm.breadcrumb[workgroupVersionsVm.breadcrumb.length-2]);

          return deleteVersionsResponse;
        })
    }

    /**
     * @name downloadVersion
     * @desc Download a version
     * @param {Object} version - version to download's document - {@link Version} object
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function downloadVersion(version) {
      var url = workgroupVersionsRestService.download(workgroupVersionsVm.currentFolder.workGroup, version.uuid);

      documentUtilsService.download(url, version.name);
    }

    /**
     * @name  downloadMultiVersions
     * @desc Trigger multiple download of versions with a confirm dialog if needed
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function downloadMultiVersions() {
      documentUtilsService.canShowMultipleDownloadConfirmationDialog(workgroupVersionsVm.selectedDocuments).then(function() {
        _.forEach(workgroupVersionsVm.selectedDocuments, function(version) {
          workgroupVersionsVm.downloadVersion(version);
        });
      });
    }

    /**
     * @name showSelectedVersionDetails
     * @desc Get information from a version and show them in the right sidebar
     * @param {Version} version - {@link Version} object
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function showSelectedVersionDetails(selectedVersion) { 
      workgroupVersionsVm.getNodeDetails(selectedVersion).then(function(data) {
        workgroupVersionsVm.currentSelectedDocument.current = data;
        workgroupVersionsVm.mdtabsSelection = {
          selectedIndex: 0
        };
        workgroupVersionsVm.loadSidebarContent(workgroupVersionsVm.workgroupNode);
      });
    }

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name getFulfilledValues
     * @desc Get deleted versions
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted version
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
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

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name getRejectedReasons
     * @desc Get the reason to reject the deletion of versions
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted version
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
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

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name isDocumentContainedInCollection
     * @desc Detect if the document is contained in the collection by leveraging its uuid
     * @param {Array<Object>} collection - List of document object
     * @param {Object} document - A document object
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function isDocumentContainedInCollection(collection, document) {
      var indexOfDocumentInCollection = _.findIndex(collection, function(collectionItem) {
        return collectionItem.uuid === document.uuid;
      });

      return indexOfDocumentInCollection !== -1;
    }

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name showNotifications
     * @desc give user feedback about deleted versions
     * @param {Array<Object>} deleteVersionsResponse - List of answers sent by the server about each deleted versions
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function showNotifications(deleteVersionsResponse) {
      if (deleteVersionsResponse.nonDeletedVersions.length > 0) {
        showErrorNotificationForNonDeletedVersions(deleteVersionsResponse.nonDeletedVersions);
      } else {
        showSuccessNotificationForDeletedVersions(deleteVersionsResponse.deletedVersions, deleteVersionsResponse.isLastVersiondeleted);
      }
    }

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name showSuccessNotificationForDeletedVersions
     * @desc Show success notification about deleted versions
     * @param {Array<Object>} deletedVersions - List of deleted versions
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function showSuccessNotificationForDeletedVersions(deletedVersions, isLastVersiondeleted) {
      var message = "";
      if(isLastVersiondeleted){
        message = 'TOAST_ALERT.ACTION.DELETE_LAST_VERSION';
      } else {
        message = (deletedVersions.length === 1) ?
          'TOAST_ALERT.ACTION.DELETE_SINGULAR_VERSION' :
          'TOAST_ALERT.ACTION.DELETE_PLURAL_VERSION';
      }

      toastService.success({ key: message });
    }

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name showErrorNotificationForNonDeletedVersions
     * @desc Show error notification about non-deleted versions
     * @param {Array<Object>} nonDeletedVersions - List of non-deleted versions
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function showErrorNotificationForNonDeletedVersions(nonDeletedVersions) {
      _.forEach(nonDeletedVersions, function(nonDeletedItem) {
        if (nonDeletedItem.data.errCode === 26448) {
          toastService.error({ key: 'TOAST_ALERT.ERROR.DELETE_ERROR.26448' });
        }
        else if (nonDeletedItem.data.errCode === 26449) {
          toastService.error({ key: 'TOAST_ALERT.ERROR.DELETE_ERROR.26449' });
        }
        else {
          toastService.error({ key: 'TOAST_ALERT.ERROR.DELETE_ERROR.error' });
        }
      });
    }

    /**
     * @name restore
     * @desc Restore selected version as current version for the file
     * @param {Version} version - {@link Version} object
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function restore(version) {
      workgroupVersionsRestService
        .restore(version.workGroup, version.parent, version.uuid)
        .then(function() {
          refreshTable();
          toastService.success({
            key: 'TOAST_ALERT.ACTION.RESTORE',
            params: {nodeName: version.name}
          });
        })
        .catch(function() {
          toastService.error({
            key: 'TOAST_ALERT.ERROR.RESTORE',
            params: {nodeName: version.name}
          });
        });
    }

    /**
     * @name copyVersionToPersonalSpace
     * @desc Copy version from current list into Personal Space
     * @param {Array<Version>} versionItems - {@link Version} object
     * @memberOf LinShare.sharedSpace.WorkgroupVersionsController
     */
    function copyVersionToPersonalSpace(versionItems) {
      var promises = [];
      _.forEach(versionItems, function(versionItem) {
        promises.push(
          workgroupNodesRestService.copyToMySpace(workgroupVersionsVm.folderDetails.workgroupUuid, versionItem.uuid)
        );
      });

      $q.all(promises).then(function(versionItems) {
        notifyCopySuccess(versionItems.length);
      }).catch(function(error) {
        switch(error.data.errCode) {
        case 26444 :
          toastService.error({key: 'TOAST_ALERT.ERROR.COPY.26444'});
          break;
        }
      });
    }
  }
})();
