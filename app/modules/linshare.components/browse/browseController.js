/**
 * browseController Controller
 * @namespace linshare.components
 */

angular
  .module('linshare.components')
  .controller('browseController', BrowseController);

BrowseController.$inject = [
  '_',
  '$q',
  '$filter',
  '$transitions',
  'functionalityRestService',
  'itemUtilsService',
  'workgroupNodesRestService',
  'workgroupPermissionsService',
  'sharedSpaceRestService',
  'workgroupVersionsRestService'
];

/**
 * @namespace BrowseController
 * @desc Controller of browse component
 * @memberOf linshare.components
 */
// TODO: Should dispatch some function to other service or controller
function BrowseController(
  _,
  $q,
  $filter,
  $transitions,
  functionalityRestService,
  itemUtilsService,
  workgroupNodesRestService,
  workgroupPermissionsService,
  sharedSpaceRestService,
  workgroupVersionsRestService
) {
  let workgroupCreatePermission;
  const browseVm = this;
  const TYPE_WORKGROUP = 'WORK_GROUP';
  const TYPE_DRIVE = 'DRIVE';
  const TYPE_FOLDER = 'FOLDER';
  const TYPE_DOCUMENT = 'DOCUMENT';

  browseVm.TYPE_FOLDER = TYPE_FOLDER;
  browseVm.TYPE_DOCUMENT = TYPE_DOCUMENT;
  browseVm.TYPE_WORKGROUP = TYPE_WORKGROUP;
  browseVm.TYPE_DRIVE = TYPE_DRIVE;
  browseVm.displayCreateInput = false;
  browseVm.newFolderName = '';
  browseVm.displayFilterInput = false;
  browseVm.filterText = '';
  browseVm.createFolder = createFolder;
  browseVm.createFolderByEnter = createFolderByEnter;
  browseVm.disableNode = disableNode;
  browseVm.loadNode = loadNode;
  browseVm.getNodeIcon = getNodeIcon;
  browseVm.handleActionOnNodeSelection = handleActionOnNodeSelection;
  browseVm.showCreateFolderInput = showCreateFolderInput;
  browseVm.hideCreateFolderInput = hideCreateFolderInput;
  browseVm.showFilterInput = showFilterInput;
  browseVm.hideFilterInput = hideFilterInput;
  browseVm.canCreateFolder = canCreateFolder;
  browseVm.canPerformAction = canPerformAction;
  browseVm.loadParentNode = loadParentNode;
  browseVm.haveSharedSpaceCreatePermission = haveSharedSpaceCreatePermission;
  browseVm.isListingSharedSpaces = isListingSharedSpaces;

  browseVm.$onInit = $onInit;

  ////////////

  function $onInit() {
    browseVm.breadcrumbs = [];
    browseVm.permissions = {};
    browseVm.performAction = browseVm.isMove ? moveNode : copyNode;
    browseVm.sourceFolder = _.cloneDeep(browseVm.currentFolder);
    browseVm.canDisplayFiles = browseVm.canDisplayFiles
      && browseVm.nodeItems
      && browseVm.nodeItems.length === 1; // Cannot add version with multiple nodes

    $transitions.onStart({}, function() {
      browseVm.$mdDialog.cancel();
    });

    functionalityRestService.getAll()
      .then(({ WORK_GROUP__CREATION_RIGHT }) => {
        workgroupCreatePermission = WORK_GROUP__CREATION_RIGHT.enable;
      })
      .then(() => browseVm.currentFolder ?
        loadFolderThenList(browseVm.currentFolder) :
        listSharedSpaces()
      );
  }

  /**
   * @name addVersion
   * @desc Add the select item as a new version of the note
   * @param {Object} node - Node to update
   * @memberOf linshare.components.BrowseController
   */
  function addVersion(node) {
    var source = browseVm.nodeItems[0];
    var nodeItems= [];
    var failedNodes= [];

    workgroupVersionsRestService.copy(node.workGroup, node.uuid, source.uuid)
      .then(function() {
        nodeItems = [source];
      }).catch(function () {
        failedNodes = [source];
      })
      .finally(function() {
        browseVm.$mdDialog.hide({
          nodeItems: nodeItems,
          failedNodes: failedNodes,
          targetNode: node
        });
      });
  }

  /**
   * @name copyNode
   * @desc Copy the node
   * @memberOf linshare.components.BrowseController
   */
  function copyNode() {
    const destination = {
      name: browseVm.currentWorkgroup.name,
      parent: browseVm.currentWorkgroup.uuid,
      workgroupUuid: browseVm.currentWorkgroup.uuid,
      workgroupName: browseVm.currentWorkgroup.name
    };

    if (
      browseVm.breadcrumbs.length &&
      _.last(browseVm.breadcrumbs).type === TYPE_FOLDER
    ) {
      _.assign(destination, _.last(browseVm.breadcrumbs));
    }

    const promises = browseVm.nodeItems.map(
      node => workgroupNodesRestService.copy(
        destination.workgroupUuid,
        node.uuid,
        destination.uuid,
        browseVm.kind
      )
    );

    $q.allSettled(promises)
      .then(results => ({
        nodeItems: results.filter(promise => promise.state === 'fulfilled').map(promise => workgroupNodesRestService.restangularize(promise.value[0])),
        failedNodes: results.filter(promise => promise.state === 'rejected').map(promise => promise.reason)
      }))
      .then(({ nodeItems, failedNodes }) => browseVm.$mdDialog.hide({
        nodeItems,
        failedNodes,
        folder: destination
      }));
  }

  /**
   * @name disableNode
   * @desc Check if node should be disabled
   * node is disabled when there is no FILE READ permission for Workgroup and
   * being one of the selected node for Folder
   * @param {Object} folder - Folder to check
   * @memberOf linshare.components.BrowseController
   */
  function disableNode(node) {
    if (node.nodeType === TYPE_WORKGROUP) {
      return !(browseVm.permissions &&
        browseVm.permissions[node.uuid] &&
        browseVm.permissions[node.uuid].FILE &&
        browseVm.permissions[node.uuid].FILE.CREATE);
    }

    return !!_.find(browseVm.nodeItems, node);
  }

  function loadFolderThenList(folder) {
    sharedSpaceRestService.get(folder.workGroup, null, true)
      .then(workgroup => {
        browseVm.currentWorkgroup = workgroup;
        browseVm.breadcrumbs.push(workgroup);

        if (!workgroup.parentUuid) {
          return $q.when([workgroup]);
        }

        return sharedSpaceRestService.get(workgroup.parentUuid, null, true).then(drive => {
          browseVm.breadcrumbs.unshift(drive);

          return [workgroup, drive];
        });
      })
      .then(workgroupPermissionsService.getWorkgroupsPermissions)
      .then(workgroupPermissionsService.formatPermissions)
      .then(formattedPermissions => {
        browseVm.permissions = formattedPermissions;
      })
      .then(() => workgroupNodesRestService.get(browseVm.currentWorkgroup.uuid, folder.uuid, true))
      .then(currentFolder => {
        browseVm.breadcrumbs.push(...currentFolder.treePath.slice(1), currentFolder);

        return listSharedSpaceNodes(currentFolder);
      });
  }

  function listSharedSpaces(drive = {}) {
    return sharedSpaceRestService.getList(true, drive.uuid)
      .then(orderNodesByModificationDate)
      .then(list => {
        browseVm.currentList = list;

        return [drive, ...list].filter(item => !!item.role);
      })
      .then(workgroupPermissionsService.getWorkgroupsPermissions)
      .then(workgroupPermissionsService.formatPermissions)
      .then(formattedPermissions => {
        browseVm.permissions = formattedPermissions;
      });
  }

  function listSharedSpaceNodes(parent = {}) {
    const nodeType = !browseVm.canDisplayFiles ? TYPE_FOLDER : null;

    return workgroupNodesRestService.getList(browseVm.currentWorkgroup.uuid, parent.uuid, nodeType)
      .then(orderNodesByModificationDate)
      .then(list => {
        browseVm.currentList = list;
      });
  }

  function loadParentNode() {
    if (!browseVm.breadcrumbs.length) {
      return;
    }

    hideCreateFolderInput();
    hideFilterInput();

    browseVm.breadcrumbs.pop();

    const parentNode = _.last(browseVm.breadcrumbs);

    if (!parentNode) {
      browseVm.currentWorkgroup = {};

      return listSharedSpaces();
    }

    if (parentNode.nodeType === TYPE_DRIVE) {
      browseVm.currentWorkgroup = {};

      return listSharedSpaces(parentNode);
    }

    if (parentNode.nodeType === TYPE_WORKGROUP) {
      return listSharedSpaceNodes();
    }

    return listSharedSpaceNodes(parentNode);
  }

  function loadNode(selectedFolder) {
    hideCreateFolderInput();
    hideFilterInput();

    browseVm.breadcrumbs.push(selectedFolder);

    if (selectedFolder.nodeType === TYPE_DRIVE) {
      return listSharedSpaces(selectedFolder);
    }

    if (selectedFolder.nodeType === TYPE_WORKGROUP) {
      browseVm.currentWorkgroup = selectedFolder;

      return listSharedSpaceNodes();
    }

    return listSharedSpaceNodes(selectedFolder);
  }

  /**
   * @name moveNode
   * @desc Move the node
   * @memberOf linshare.components.BrowseController
   */
  function moveNode() {
    const destination = {
      uuid: browseVm.currentWorkgroup.uuid,
      name: browseVm.currentWorkgroup.name,
      parent: browseVm.currentWorkgroup.uuid,
      workgroupName: browseVm.currentWorkgroup.name,
      workgroupUuid: browseVm.currentWorkgroup.uuid
    };


    if (
      browseVm.breadcrumbs.length &&
      _.last(browseVm.breadcrumbs).type === TYPE_FOLDER
    ) {
      _.assign(destination, _.last(browseVm.breadcrumbs));
    }

    const promises = browseVm.nodeItems.map(
      node => workgroupNodesRestService.update(node.workGroup, {
        ...node,
        parent: destination.uuid,
        workGroup: destination.workgroupUuid
      })
    );

    $q.allSettled(promises)
      .then(results => ({
        nodeItems: results.filter(promise => promise.state === 'fulfilled').map(promise => promise.value),
        failedNodes: results.filter(promise => promise.state === 'rejected').map(promise => promise.reason)
      }))
      .then(({ nodeItems, failedNodes }) => browseVm.$mdDialog.hide({
        nodeItems,
        failedNodes,
        folder: destination
      }));
  }

  /**
   * @name handleActionOnNodeSelection
   * @desc handle selection of a node and dispatch to the action bind to the node type
   * @param {WorkgroupNode} node - The selected node
   * @memberOf linshare.components.BrowseController
   */
  function handleActionOnNodeSelection(node) {
    if (node.type === TYPE_DOCUMENT) {
      addVersion(node);
    } else {
      loadNode(node);
    }
  }

  /**
   * @name showCreateFolderInput
   * @desc show create new folder input
   * @memberOf linshare.components.BrowseController
   */
  function showCreateFolderInput() {
    browseVm.displayCreateInput = true;
    scrollAndFocusTo('#js-lv-create-new-folder');
  }

  /**
   * @name hideCreateFolderInput
   * @desc hide create new folder input
   * @memberOf linshare.components.BrowseController
   */
  function hideCreateFolderInput() {
    browseVm.newFolderName = '';
    browseVm.displayCreateInput = false;
  }

  function showFilterInput() {
    browseVm.displayFilterInput = true;
    scrollAndFocusTo('#js-filter-workgroup-input');
  }

  function hideFilterInput() {
    browseVm.filterText = '';
    browseVm.displayFilterInput = false;
  }

  function scrollAndFocusTo(field) {
    const offsetTop = $(field).offset().top;

    if (offsetTop < 0) {
      $('#lv-dialog-content-ctn .lv-ctn').animate({
        'scrollTop': $(field).offset().top
      }, 300);
    }

    setTimeout(() => $(`${field} input`).trigger('focus'));
  }

  /**
   * @name createFolder
   * @desc Create a folder
   * @memberOf linshare.components.BrowseController
   */
  function createFolder() {
    if (browseVm.canCreateFolder() && itemUtilsService.isNameValid(browseVm.newFolderName)) {
      const newFolderObject = {
        name: browseVm.newFolderName,
        parent: _.last(browseVm.breadcrumbs).uuid,
        type: TYPE_FOLDER
      };

      workgroupNodesRestService.create(browseVm.currentWorkgroup.uuid, newFolderObject, false)
        .then(newlyCreatedFolder => {
          browseVm.currentList.unshift(newlyCreatedFolder);
          hideCreateFolderInput();
        });
    }
  }

  function createFolderByEnter($event) {
    if ($event.charCode === 13) {
      $event.preventDefault();
      createFolder();
    }
  }

  function orderNodesByModificationDate(list) {
    return _.orderBy(list, 'modificationDate', 'desc');
  }

  function getNodeIcon (node) {
    if (node.nodeType === TYPE_WORKGROUP) {
      return 'ls-workgroup';
    }

    if (node.nodeType === TYPE_DRIVE) {
      return 'ls-drive';
    }

    if (node.type === TYPE_FOLDER) {
      return 'ls-folder';
    }

    if (node.type === TYPE_DOCUMENT) {
      return $filter('mimetypeIcone')(node.mimeType);
    }
  }

  function canPerformAction() {
    if (!browseVm.breadcrumbs.length || _.last(browseVm.breadcrumbs).nodeType === TYPE_DRIVE) {
      return false;
    }

    if (browseVm.isMove) {
      return _.last(browseVm.breadcrumbs).uuid !== browseVm.sourceFolder.uuid;
    }

    return true;
  }

  function canCreateFolder() {
    if (browseVm.currentWorkgroup && browseVm.permissions) {
      return browseVm.permissions[browseVm.currentWorkgroup.uuid] &&
        browseVm.permissions[browseVm.currentWorkgroup.uuid].FOLDER &&
        browseVm.permissions[browseVm.currentWorkgroup.uuid].FOLDER.CREATE;
    }
  }

  function isListingSharedSpaces() {
    return !browseVm.breadcrumbs.length || (
      browseVm.breadcrumbs.length === 1 &&
      browseVm.breadcrumbs[0].nodeType === TYPE_DRIVE
    );
  }

  function haveSharedSpaceCreatePermission() {
    if (!browseVm.breadcrumbs.length) {
      return workgroupCreatePermission;
    }

    if (browseVm.breadcrumbs.length === 1 && browseVm.breadcrumbs[0].nodeType === TYPE_DRIVE) {
      return workgroupCreatePermission &&
        browseVm.permissions[browseVm.breadcrumbs[0].uuid] &&
        browseVm.permissions[browseVm.breadcrumbs[0].uuid].WORKGROUP &&
        browseVm.permissions[browseVm.breadcrumbs[0].uuid].WORKGROUP.CREATE;
    }
  }
}
