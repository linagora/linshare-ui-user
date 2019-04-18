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
    '$filter',
    '$q',
    '$scope',
    '$state',
    '$transition$',
    'auditDetailsService',
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
    $filter,
    $q,
    $scope,
    $state,
    $transition$,
    auditDetailsService,
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
    workgroupRevisionsVm.selectDocumentsOnCurrentPage = selectDocumentsOnCurrentPage;
    workgroupRevisionsVm.addSelectedDocument = addSelectedDocument;
    workgroupRevisionsVm.showFileDetails = showFileDetails;
    workgroupRevisionsVm.loadSidebarContent = loadSidebarContent;
    workgroupRevisionsVm.workgroupNode = lsAppConfig.workgroupNode;

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
        .then(function(data) {
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
      if (flowFile.isRevision === true) {
        if (flowFile.folderDetails.workgroupUuid === workgroupRevisionsVm.folderDetails.workgroupUuid &&
          flowFile.folderDetails.folderUuid === workgroupRevisionsVm.folderDetails.folderUuid) {
          flowFile.asyncUploadDeferred.promise.then(function(file) {
            addNewItemInTableParams(file.linshareDocument);
          });
        }
      }
    }

    function upload(flowFiles, folderDetails) {
      _.forEachRight(flowFiles, function(file) {
        file.isRevision = true;
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
  }
})();
