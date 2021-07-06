angular
  .module('linshare.sharedSpace')
  .controller('workgroupNodesSearchController', workgroupNodesSearchController);

workgroupNodesSearchController.$inject = [
  '_',
  '$q',
  '$scope',
  '$state',
  '$stateParams',
  'auditDetailsService',
  'documentPreviewService',
  'documentUtilsService',
  'functionalityRestService',
  'lsAppConfig',
  'tableParamsService',
  'toastService',
  'sidebarService',
  'workgroupNodesRestService',
  'sharedSpaceRestService',
  'unitService',
  'sharedSpace',
  'folder',
  'permissions'
];

function workgroupNodesSearchController(
  _,
  $q,
  $scope,
  $state,
  $stateParams,
  auditDetailsService,
  documentPreviewService,
  documentUtilsService,
  functionalityRestService,
  lsAppConfig,
  tableParamsService,
  toastService,
  sidebarService,
  workgroupNodesRestService,
  sharedSpaceRestService,
  unitService,
  sharedSpace,
  folder,
  permissions
)
{
  const workgroupSearchVm = this;

  const TYPE_DOCUMENT = 'DOCUMENT';
  const TYPE_FOLDER = 'FOLDER';
  const TYPE_REVISION = 'DOCUMENT_REVISION';

  workgroupSearchVm.mdtabsSelection = { selectedIndex: 0 };
  workgroupSearchVm.functionalities = {};
  workgroupSearchVm.canDeleteNodes = false;
  workgroupSearchVm.TYPE_DOCUMENT = TYPE_DOCUMENT;
  workgroupSearchVm.TYPE_FOLDER = TYPE_FOLDER;
  workgroupSearchVm.TYPE_REVISION = TYPE_REVISION;
  workgroupSearchVm.searchParams = $stateParams.searchParams;
  workgroupSearchVm.sharedSpace = sharedSpace;
  workgroupSearchVm.permissions = permissions;
  workgroupSearchVm.breadcrumb = [];
  workgroupSearchVm.currentSelectedDocument = {};
  workgroupSearchVm.downloadNode = downloadNode;
  workgroupSearchVm.getNodeDetails = getNodeDetails;
  workgroupSearchVm.goToFolder = goToFolder;
  workgroupSearchVm.goToDrive = goToDrive;
  workgroupSearchVm.goToNodeDestination = goToNodeDestination;
  workgroupSearchVm.goToPreviousFolder = goToPreviousFolder;
  workgroupSearchVm.isDocument = isDocument;
  workgroupSearchVm.multiDownload = multiDownload;
  workgroupSearchVm.showSelectedNodeDetails = showSelectedNodeDetails;
  workgroupSearchVm.showWorkgroupDetails = showWorkgroupDetails;
  workgroupSearchVm.thumbnailEngineActivated = lsAppConfig.thumbnailEngineActivated;
  workgroupSearchVm.canDownloadSelectedNodes = canDownloadSelectedNodes;
  workgroupSearchVm.driveUuid = $state.params && $state.params.driveUuid;
  workgroupSearchVm.updateSearchParams = updateSearchParams;
  workgroupSearchVm.getNodePath = node => node.treePath.slice(1).map(e => e.name).join('/');

  workgroupSearchVm.$onInit = $onInit;

  ////////////

  function $onInit() {

    functionalityRestService.getAll().then(({
      CONTACTS_LIST__CREATION_RIGHT,
      WORK_GROUP,
      WORK_GROUP__DOWNLOAD_ARCHIVE,
      WORK_GROUP__FILE_VERSIONING
    }) => {
      workgroupSearchVm.functionalities.contactsList = CONTACTS_LIST__CREATION_RIGHT;
      workgroupSearchVm.canAddVersion = WORK_GROUP__FILE_VERSIONING.enable;
      workgroupSearchVm.canDownloadArchive = WORK_GROUP__DOWNLOAD_ARCHIVE.enable;
      workgroupSearchVm.functionalities.canOverrideVersioning = WORK_GROUP.enable && WORK_GROUP__FILE_VERSIONING.canOverride;
      workgroupSearchVm.downloadArchiveThreshold = WORK_GROUP__DOWNLOAD_ARCHIVE.maxValue < 0 ?
        Infinity :
        unitService.toByte(WORK_GROUP__DOWNLOAD_ARCHIVE.maxValue, unitService.formatUnit(WORK_GROUP__DOWNLOAD_ARCHIVE.maxUnit));

      if (sharedSpace.parentUuid) {
        sharedSpaceRestService.get(sharedSpace.parentUuid, null, true).then(drive => {
          workgroupSearchVm.drive = drive;
        });
      }
    });

    Object.assign(
      documentPreviewService,
      {
        download: downloadNode,
        showItemDetails: item => showSelectedNodeDetails(item)
      }
    );

    buildBreadcrumbs();
    initializeTable();
  }

  function initializeTable() {
    tableParamsService.initTableParamsWithFetcher(nodesFetcher);
    workgroupSearchVm.tableParamsService = tableParamsService;
    workgroupSearchVm.lengthOfSelectedDocuments = tableParamsService.lengthOfSelectedDocuments;
    workgroupSearchVm.resetSelectedDocuments = tableParamsService.resetSelectedItems;
    workgroupSearchVm.selectDocumentsOnCurrentPage = tableParamsService.tableSelectAll;
    workgroupSearchVm.addSelectedDocument = tableParamsService.toggleItemSelection;
    workgroupSearchVm.sortDropdownSetActive = tableParamsService.tableSort;
    workgroupSearchVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
    workgroupSearchVm.tableParams = tableParamsService.getTableParams();
    workgroupSearchVm.selectedDocuments = tableParamsService.getSelectedItemsList();
    workgroupSearchVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
    workgroupSearchVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
  }

  function buildBreadcrumbs() {
    workgroupSearchVm.breadcrumb = folder.treePath || [];
    workgroupSearchVm.breadcrumb.shift();

    if (folder.parent !== folder.workGroup) {
      workgroupSearchVm.breadcrumb.push({
        name: folder.name,
        uuid: folder.uuid
      });
    }
  }

  function nodesFetcher(tableParams) {
    return workgroupNodesRestService.search($stateParams.sharedSpace, {
      tree: true,
      parent: $stateParams.parent,
      ...getTableParams(),
      ...getSearchParams()
    }).then(({ data, headers }) => {
      tableParams.total(+headers('total-elements'));

      return data;
    });

    function getTableParams() {
      const orderBy = tableParams.orderBy() && tableParams.orderBy()[0];

      return {
        pageSize: tableParams.count(),
        pageNumber: tableParams.page() - 1,
        sortField: orderBy ? orderBy.slice(1) : null,
        sortOrder: orderBy && orderBy[0] === '+' ? 'ASC' : 'DESC',
      };
    }

    function getSearchParams() {
      const searchParams = workgroupSearchVm.searchParams;

      return {
        pattern: searchParams.pattern,
        type: searchParams.type,
        kind: searchParams.kind,
        lastAuthor: searchParams.lastAuthor && searchParams.lastAuthor.identifier || null,
        minSize: searchParams.sizeUnit && searchParams.sizeStart && unitService.toByte(searchParams.sizeStart, searchParams.sizeUnit.value),
        maxSize: searchParams.sizeUnit && searchParams.sizeEnd && unitService.toByte(searchParams.sizeEnd, searchParams.sizeUnit.value),
        creationDateAfter: searchParams.creationDateAfter,
        creationDateBefore: searchParams.creationDateBefore,
        modificationDateAfter: searchParams.modificationDateAfter,
        modificationDateBefore: searchParams.modificationDateBefore
      };
    }
  }

  function downloadNode(node) {
    const downloadUrl = workgroupNodesRestService.download(sharedSpace.uuid, node.uuid);

    if ([TYPE_DOCUMENT, TYPE_REVISION].includes(node.type)) {
      return documentUtilsService.download(downloadUrl, node.name);
    }

    workgroupNodesRestService
      .metadata(sharedSpace.uuid, node.uuid)
      .then(nodeDetail => {
        if (nodeDetail.size > workgroupSearchVm.downloadArchiveThreshold) {
          toastService.error({ key: 'TOAST_ALERT.ERROR.DOWNLOAD_FOLDER' });

          return;
        }

        documentUtilsService.download(downloadUrl, node.name);
      });
  }

  function canDownloadSelectedNodes() {
    if (!workgroupSearchVm.permissions.FILE.READ) {
      return false;
    }

    if (workgroupSearchVm.selectedDocuments.some(file => file.type === TYPE_FOLDER)) {
      return workgroupSearchVm.canDownloadArchive;
    }

    return true;
  }

  function getNodeDetails(nodeItem) {
    return $q.all([
      workgroupNodesRestService.get(sharedSpace.uuid, nodeItem.uuid),
      workgroupNodesRestService.getAudit(sharedSpace.uuid, nodeItem.uuid)
    ])
      .then(([nodeDetails, nodeAudit]) => $q.all([
        documentUtilsService.loadItemThumbnail(nodeDetails, workgroupNodesRestService.thumbnail.bind(
          null,
          sharedSpace.uuid,
          nodeItem.uuid
        )),
        auditDetailsService.generateAllDetails(
          $scope.userLogged.uuid,
          nodeAudit.plain()
        )
      ]))
      .then(([nodeDetails, auditActions]) => Object.assign({}, nodeDetails, { auditActions: auditActions }));
  }

  function goToNodeDestination(node) {
    let destination;
    const parentNode = node.treePath.pop();
    const params = {
      workgroupUuid: sharedSpace.uuid,
      workgroupName: sharedSpace.name
    };

    if (node.type === TYPE_REVISION) {
      destination = 'sharedspace.workgroups.version';
      params.fileUuid = parentNode.uuid;
      params.fileName =  parentNode.name.trim();
    } else {
      destination = 'sharedspace.workgroups.folder';
      params.folderUuid = parentNode.uuid;
      params.folderName = parentNode.name.trim();
      params.uploadedFileUuid = node.uuid;
    }

    $state.go(destination, params);
  }

  function goToFolder(folder) {
    let routeStateSuffix = 'root';
    const params = {
      workgroupUuid: sharedSpace.uuid,
      workgroupName: sharedSpace.name.trim()
    };

    if (folder) {
      params.parentUuid = folder.parent;
      params.folderUuid = folder.uuid;
      params.folderName = folder.name.trim();
      routeStateSuffix = params.parentUuid !== params.workgroupUuid ? 'folder' : 'root';
    }

    $state.go(`sharedspace.workgroups.${routeStateSuffix}`, params);
  }

  function goToPreviousFolder(goToWorkgroupPage, folder) {
    if (goToWorkgroupPage) {
      if (sharedSpace && sharedSpace.parentUuid) {
        $state.go('sharedspace.drive', { driveUuid: sharedSpace.parentUuid });
      } else {
        $state.go('sharedspace.all');
      }
    } else {
      workgroupSearchVm.goToFolder(folder);
    }
  }

  function isDocument(nodeType) {
    return (nodeType === TYPE_DOCUMENT || nodeType === TYPE_REVISION);
  }

  function updateSearchParams(params) {
    workgroupSearchVm.searchParams = params;

    workgroupSearchVm.tableParams.reload();
    workgroupSearchVm.tableParams.page(1);
  }

  function multiDownload() {
    documentUtilsService
      .canShowMultipleDownloadConfirmationDialog(workgroupSearchVm.selectedDocuments)
      .then(result => result && _.forEach(workgroupSearchVm.selectedDocuments, downloadNode));
  }

  function showSelectedNodeDetails(selectedNode, list, index) {
    workgroupSearchVm.getNodeDetails(selectedNode).then(node => {
      workgroupSearchVm.currentSelectedDocument.current = node;
      workgroupSearchVm.currentSelectedDocument.current.index = index || 0;
      workgroupSearchVm.currentSelectedDocument.list = Array.isArray(list) && list.length ? list : [node];
      workgroupSearchVm.mdtabsSelection.selectedIndex = 0;

      _loadSidebarContent(lsAppConfig.workgroupNode);
    });
  }

  function showWorkgroupDetails(showMemberTab) {
    sharedSpaceRestService.get(sharedSpace.uuid, true, true)
      .then(_fetchDriveOfWorkgroup)
      .then(workgroup => {
        workgroupSearchVm.currentDrive = workgroup.drive;
        workgroupSearchVm.currentSelectedDocument.current = Object.assign({}, workgroup);
        workgroupSearchVm.currentSelectedDocument.original = Object.assign({}, workgroup);

        return sharedSpaceRestService.getQuota(workgroupSearchVm.currentSelectedDocument.current.quotaUuid);
      })
      .then(quotas => {
        workgroupSearchVm.currentSelectedDocument.quotas = quotas;
        workgroupSearchVm.mdtabsSelection.selectedIndex = showMemberTab ? 1 : 0;


        _loadSidebarContent(lsAppConfig.workgroupPage);
      });
  }


  function goToDrive() {
    if (workgroupSearchVm.drive) {
      $state.go('sharedspace.drive', {driveUuid: workgroupSearchVm.drive.uuid});
    }
  }

  function _fetchDriveOfWorkgroup(workgroup) {
    if (workgroup && workgroup.parentUuid) {
      return sharedSpaceRestService.get(workgroup.parentUuid, null, true)
        .then(drive => ({...workgroup, drive}));
    }

    return $q.resolve(workgroup);
  }

  function _loadSidebarContent(content) {
    sidebarService.setData(workgroupSearchVm);
    sidebarService.setContent(content);
    sidebarService.show();
  }
}
