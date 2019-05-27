/**
 * WorkgroupRevisionsController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('notification');
    }])
    .controller('WorkgroupRevisionsController', WorkgroupRevisionsController);

  WorkgroupRevisionsController.$inject = [
    '_',
    '$filter',
    '$q',
    '$scope',
    '$state',
    '$transition$',
    'auditDetailsService',
    'browseService',
    'currentFolder',
    'documentUtilsService',
    'flowUploadService',
    'lsAppConfig',
    'nodesList',
    'tableParamsService',
    'toastService',
    'workgroup',
    'workgroupNodesRestService',
    'workgroupPermissions',
    'workgroupRevisionsRestService'
  ];

  /**
   * @namespace WorkgroupRevisionsController
   * @desc Application revision management system controller
   * @revisionOf LinShare.sharedSpace
   */
  function WorkgroupRevisionsController(
    _,
    $filter,
    $q,
    $scope,
    $state,
    $transition$,
    auditDetailsService,
    browseService,
    currentFolder,
    documentUtilsService,
    flowUploadService,
    lsAppConfig,
    nodesList,
    tableParamsService,
    toastService,
    workgroup,
    workgroupNodesRestService,
    workgroupPermissions,
    workgroupRevisionsRestService
  ) {
    var workgroupRevisionsVm = this;
    const TYPE_REVISION = 'DOCUMENT_REVISION';

    const TYPE_DOCUMENT = 'DOCUMENT';
    const TYPE_FOLDER = 'FOLDER';

    workgroupRevisionsVm.paramFilter = {
      name: ''
    };
    workgroupRevisionsVm.canDeleteNodes = false;
    workgroupRevisionsVm.currentSelectedDocument = {};
    workgroupRevisionsVm.todo = todo;
    workgroupRevisionsVm.folderDetails = _.cloneDeep($transition$.params());
    workgroupRevisionsVm.currentFolder = currentFolder;
    workgroupRevisionsVm.breadcrumb = [];
    workgroupRevisionsVm.upload = upload;
    workgroupRevisionsVm.revisionsList = nodesList;
    workgroupRevisionsVm.permissions = workgroupPermissions;
    workgroupRevisionsVm.tableParamsService = tableParamsService;
    workgroupRevisionsVm.flowUploadService = flowUploadService;
    workgroupRevisionsVm.getNodeDetails = getNodeDetails;
    workgroupRevisionsVm.addUploadedDocument = addUploadedDocument;
    workgroupRevisionsVm.goToFolder = goToFolder;
    workgroupRevisionsVm.openBrowser = openBrowser;
    workgroupRevisionsVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    workgroupRevisionsVm.addSelectedDocument = addSelectedDocument;
    workgroupRevisionsVm.showFileDetails = showFileDetails;
    workgroupRevisionsVm.toggleSearchState = toggleSearchState;
    workgroupRevisionsVm.loadSidebarContent = loadSidebarContent;
    workgroupRevisionsVm.workgroupNode = lsAppConfig.workgroupNode;
    workgroupRevisionsVm.deleteVersions = deleteVersions;
    workgroupRevisionsVm.downloadVersion = downloadVersion;
    workgroupRevisionsVm.downloadMultiVersions = downloadMultiVersions;
    workgroupRevisionsVm.restore = restore;
    workgroupRevisionsVm.showSelectedRevisionDetails = showSelectedRevisionDetails;

    activate();

    function activate() {

      workgroupRevisionsVm.folderDetails.workgroupName = workgroup.name;
      workgroupRevisionsVm.folderDetails.folderName = currentFolder.name;
      workgroupRevisionsVm.folderDetails.folderUuid = currentFolder.uuid;
      workgroupRevisionsVm.folderDetails.quotaUuid = workgroup.quotaUuid;

      launchTableParamsInit();
      getBreadcrumb();
    }

    function todo(){
      toastService.error({key: 'Please code me!'});
    }

    function launchTableParamsInit() {
      tableParamsService.initTableParams(workgroupRevisionsVm.revisionsList, workgroupRevisionsVm.paramFilter,
        workgroupRevisionsVm.folderDetails.uploadedFileUuid)
        .then(function() {
          workgroupRevisionsVm.tableParamsService = tableParamsService;
          workgroupRevisionsVm.tableParams = tableParamsService.getTableParams();
          workgroupRevisionsVm.resetSelectedDocuments = tableParamsService.resetSelectedItems;
          workgroupRevisionsVm.selectedDocuments = tableParamsService.getSelectedItemsList();
          workgroupRevisionsVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
          workgroupRevisionsVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
          workgroupRevisionsVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
        });
    }

    /**
     * @name loadSidebarContent
     * @desc Update the content of the sidebar
     * @param {string} content - The id of the content to load, see app/views/includes/sidebar-right.html
     * for possible values
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    // TODO : service with content and vm as parameter (because these 3 line are always same in all controller...)
    function loadSidebarContent(content) {
      $scope.mainVm.sidebar.setData(workgroupRevisionsVm);
      $scope.mainVm.sidebar.setContent(content);
      $scope.mainVm.sidebar.show();
    }

    // TODO: Define Revision type
    /**
     * @name addSelectedDocument
     * @desc Select given document
     * @param {Revision} item - {@link Revision} object
     * @param {Number} page - Number of the page shown
     * @param {Boolean} selectFlag - Value to set document as selected or not, default toggle current selection value
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function addSelectedDocument(item) {
      tableParamsService.toggleItemSelection(item);
      workgroupRevisionsVm.canDeleteNodes = $filter('canDeleteNodes')(
        workgroupRevisionsVm.selectedDocuments,
        workgroupRevisionsVm.permissions
      );
    };

    // TODO: Define Revision type
    /**
     * @name selectDocumentOnCurrentPage
     * @desc Select document of the current table page shown
     * @param {Array<Revision>} data - List of document revision to select/unselect
     * @param {Number} page - Number of the page shown
     * @param {Boolean} selectFlag - Value to set document as selected or not, default toggle current selection value
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function selectDocumentsOnCurrentPage(data, page, selectFlag){
      tableParamsService.tableSelectAll(data, page, selectFlag);
      workgroupRevisionsVm.canDeleteNodes = $filter('canDeleteNodes')(
        workgroupRevisionsVm.selectedDocuments,
        workgroupRevisionsVm.permissions
      );
    };

    /**
     * @name showFileDetails
     * @desc Get current file details
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function showFileDetails() {
      const workgroupUuid = workgroupRevisionsVm.folderDetails.workgroupUuid;
      const nodeUuid = workgroupRevisionsVm.folderDetails.folderUuid;

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

          workgroupRevisionsVm.currentSelectedDocument.current = Object.assign(
            {},
            nodeDetails,
            nodeThumbnail,
            { auditActions: auditActions }
          );
          workgroupRevisionsVm.loadSidebarContent(workgroupRevisionsVm.workgroupNode);
        });
    }

    // TODO: Should be a directive
    /**
     * @name toggleSearchState
     * @desc Toggle activation of the search bar for mobile mode
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function toggleSearchState() {
      if (!workgroupRevisionsVm.searchMobileDropdown) {
        angular.element('#drop-area').addClass('search-toggled');
        angular.element('#top-search-wrap input').focus();
      } else {
        angular.element('#drop-area').removeClass('search-toggled');
        angular.element('#searchInMobileFiles').val('').trigger('change');
      }
      workgroupRevisionsVm.searchMobileDropdown = !workgroupRevisionsVm.searchMobileDropdown;
    }

    function getNodeDetails(nodeItem) {
      // TODO : change the watcher method in activate() of workgroupMembersController, then do it better
      $scope.mainVm.sidebar.setContent(workgroupRevisionsVm.workgroupNode);

      return $q
        .all([
          workgroupRevisionsRestService.get(
            workgroupRevisionsVm.folderDetails.workgroupUuid,
            nodeItem.uuid
          ),
          workgroupRevisionsRestService.getAudit(
            workgroupRevisionsVm.folderDetails.workgroupUuid,
            nodeItem.uuid
          )
        ])
        .then(function(workgroupRevisionsRestServiceAnswers) {
          var nodeDetails = workgroupRevisionsRestServiceAnswers[0];
          var nodeAudit = workgroupRevisionsRestServiceAnswers[1];

          return $q.all([
            documentUtilsService.loadItemThumbnail(
              nodeDetails,
              workgroupRevisionsRestService.thumbnail.bind(
                null,
                workgroupRevisionsVm.folderDetails.workgroupUuid,
                nodeItem.uuid
              )
            ),
            auditDetailsService.generateAllDetails(
              $scope.userLogged.uuid,
              nodeAudit.plain()
            ),
          ]);
        })
        .then(function(workgroupRevisionsRestServiceAnswers) {
          var nodeDetails = workgroupRevisionsRestServiceAnswers[0];
          var auditActions = workgroupRevisionsRestServiceAnswers[1];

          return Object.assign(
            {},
            nodeDetails,
            { auditActions: auditActions }
          );
        });
    }

    function addNewItemInTableParams(newItem) {
      workgroupRevisionsVm.revisionsList.push(newItem);
      workgroupRevisionsVm.tableParamsService.reloadTableParams();
    }

    function addUploadedDocument(flowFile) {
        if (flowFile.folderDetails.workgroupUuid === workgroupRevisionsVm.folderDetails.workgroupUuid &&
          flowFile.folderDetails.folderUuid === workgroupRevisionsVm.folderDetails.folderUuid) {
          flowFile.asyncUploadDeferred.promise.then(function(file) {
            file.linshareDocument.type === TYPE_REVISION && addNewItemInTableParams(file.linshareDocument);
          });
        }
    }

    /**
     * @name openBrowser
     * @desc Open browser of folders to copy a revision
     * @param {Array<Object>} nodeItems - Nodes to copy/move
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
        workgroupRevisionsVm.tableParamsService.reloadTableParams();
      });
    }

    /**
     * @name openBrowserNotify
     * @desc Check result of browser close and notify it
     * @param {object} data - mdDialog's close datas
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function openBrowserNotify(data) {
      if (data.folder.uuid === workgroupRevisionsVm.currentFolder.uuid) {
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
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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

            workgroupRevisionsVm.goToFolder(data.folder, true, nodeToSelectUuid);
          }
        }
      });
    }

    /**
     * @name notifyCopySuccess
     * @desc Notify success on simple node copy
     * @param {number} nbNodes - Number of nodes simple copy success
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
      workgroupRevisionsVm.tableParamsService.reloadTableParams();
    }

    /**
     * @name getBreadcrumb
     * @desc Generate breadcrumb object for revesion file view
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function getBreadcrumb() {
      workgroupRevisionsVm.breadcrumb = workgroupRevisionsVm.currentFolder.treePath || [];
      workgroupRevisionsVm.breadcrumb.shift();
      workgroupRevisionsVm.breadcrumb.push({
        name : workgroupRevisionsVm.currentFolder.name,
        uuid: workgroupRevisionsVm.currentFolder.uuid
      })
    }

    /**
     * @name goToFolder
     * @desc Enter inside a folder
     * @param {object} folder - Folder where to enter
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function goToFolder(folder) {
      var folderDetails = {
        workgroupUuid: workgroupRevisionsVm.folderDetails.workgroupUuid,
        workgroupName: workgroupRevisionsVm.folderDetails.workgroupName.trim()
      };
      var routeStateSuffix = 'root';

      if(!_.isNil(folder)) {
        folderDetails = {
          workgroupUuid: folder.workgroupUuid || workgroupRevisionsVm.folderDetails.workgroupUuid,
          workgroupName: folder.workgroupName || workgroupRevisionsVm.folderDetails.workgroupName.trim(),
          parentUuid: folder.parent,
          folderUuid: folder.uuid,
          folderName: folder.name.trim()
        };
        routeStateSuffix = folderDetails.parentUuid !== folderDetails.workgroupUuid ? 'folder' : 'root';
      }
        $state.go('sharedspace.workgroups.' + routeStateSuffix, folderDetails);
    }

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name deleteVersions
     * @desc Delete versions and notify the user
     * @param {Array<Object>} versions - List of versions to delete
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function deleteVersions(versions) {
      var messageKey = documentUtilsService.itemUtilsConstant.WORKGROUP_REVISION;
      var isLastRevision = false;

      if(workgroupRevisionsVm.revisionsList.length === versions.length) {
        isLastRevision = true;
        messageKey = versions.length === 1
        ? documentUtilsService.itemUtilsConstant.WORKGROUP_REVISION_LAST
        : documentUtilsService.itemUtilsConstant.WORKGROUP_REVISION_ALL;
      }

      documentUtilsService.deleteItem(
        versions,
        messageKey,
        function(versions) {
          doDeleteRevison(versions, isLastRevision).then(showNotifications);
        })
    }

    // TODO Add a service for delete nodes to avoid the huge duplication in revisions and nodes controller

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name doDeleteRevison
     * @desc Delete versions
     * @param {Array<Object>} versions - List of versions to delete
     * @param {boolean} isLastRevision - Determine if the revision is the last one that exists
     * @returns {Object} deleted and nonDeleted versions
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function doDeleteRevison(versions, isLastRevision) {
      var removedVersions = [];

      if(isLastRevision) {
        removedVersions.push(workgroupRevisionsRestService.remove(versions[0].workGroup, versions[0].parent));
      } else {
        removedVersions = _.map(versions, function(version) {
          return version.remove();
        })
      }

      return $q
        .allSettled(removedVersions)
        .then(function(removeVersionsValues) {
          var deletedVersions = getFulfilledValues(removeVersionsValues);
          var nonDeletedVersions = getRejectedReasons(removeVersionsValues);

          _.remove(workgroupRevisionsVm.revisionsList, function(version) {
            return isDocumentContainedInCollection(deletedVersions, version);
          });
          
          workgroupRevisionsVm.resetSelectedDocuments();
          workgroupRevisionsVm.tableParamsService.reloadTableParams();
          $scope.mainVm.sidebar.hide(versions);

          return {
            deletedVersions: deletedVersions,
            nonDeletedVersions: nonDeletedVersions,
            isLastVersiondeleted: isLastRevision
          };
        })
        .finally(function(deleteVersionsResponse) {
          isLastRevision && goToFolder(workgroupRevisionsVm.breadcrumb[workgroupRevisionsVm.breadcrumb.length-2]);

          return deleteVersionsResponse;
        })
    }

    /**
     * @name downloadVersion
     * @desc Download a version
     * @param {Object} version - version to download's document - {@link Revision} object
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function downloadVersion(version) {
      var url = workgroupRevisionsRestService.download(workgroupRevisionsVm.currentFolder.workGroup, version.uuid);

      documentUtilsService.download(url, version.name);
    }

    /**
     * @name  downloadMultiVersions
     * @desc Trigger multiple download of versions with a confirm dialog if needed
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function downloadMultiVersions() {
      documentUtilsService.canShowMultipleDownloadConfirmationDialog(workgroupRevisionsVm.selectedDocuments).then(function() {
        _.forEach(workgroupRevisionsVm.selectedDocuments, function(version) {
          workgroupRevisionsVm.downloadVersion(version);
        });
      });
    }

    /**
     * @name showSelectedRevisionDetails
     * @desc Get information from a revision and show them in the right sidebar
     * @param {Revision} revision - {@link Revision} object
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function showSelectedRevisionDetails(selectedRevision) { 
      workgroupRevisionsVm.getNodeDetails(selectedRevision).then(function(data) {
        workgroupRevisionsVm.currentSelectedDocument.current = data;
        workgroupRevisionsVm.mdtabsSelection = {
          selectedIndex: 0
        };
        workgroupRevisionsVm.loadSidebarContent(workgroupRevisionsVm.workgroupNode);
      });
    }

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name getFulfilledValues
     * @desc Get deleted versions
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted version
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
     * @desc Get the reason to reject the deletion of revisions
     * @param {Array<Object>} allSettledAnswer - List of answers sent by the server about each deleted version
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function showSuccessNotificationForDeletedVersions(deletedVersions, isLastVersiondeleted) {
      var message = "";
      if(isLastVersiondeleted){
        message = 'TOAST_ALERT.ACTION.DELETE_LAST_REVISION';
      } else {
        message = (deletedVersions.length === 1) ?
          'TOAST_ALERT.ACTION.DELETE_SINGULAR_REVISION' :
          'TOAST_ALERT.ACTION.DELETE_PLURAL_REVISION';
      }

      toastService.success({ key: message });
    }

    // TODO define more explicitly the type of the param (Object is too wide as a type)
    /**
     * @name showErrorNotificationForNonDeletedVersions
     * @desc Show error notification about non-deleted versions
     * @param {Array<Object>} nonDeletedVersions - List of non-deleted versions
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
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
     * @desc Restore selected revision as current revision for the file
     * @param {Revision} revision - {@link Revision} object
     * @memberOf LinShare.sharedSpace.WorkgroupRevisionsController
     */
    function restore(revision) {
      workgroupRevisionsRestService
        .restore(revision.workGroup, revision.parent, revision.uuid)
        .then(function(response) {
          workgroupRevisionsVm.tableParamsService.reloadTableParams();
          toastService.success({
            key: 'TOAST_ALERT.ACTION.RESTORE',
            params: {nodeName: revision.name}
          });
        })
        .catch(function(error) {
          toastService.error({
            key: 'TOAST_ALERT.ERROR.RESTORE',
            params: {nodeName: revision.name}
          });
        });
    }
  }
})();
