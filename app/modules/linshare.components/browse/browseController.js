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
  '$transitions',
  'functionalityRestService',
  'itemUtilsService',
  'workgroupNodesRestService',
  'workgroupPermissionsService',
  'workgroupRestService',
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
  $transitions,
  functionalityRestService,
  itemUtilsService,
  workgroupNodesRestService,
  workgroupPermissionsService,
  workgroupRestService,
  workgroupVersionsRestService
) {
  const browseVm = this;
  const TYPE_FOLDER = 'FOLDER';
  const TYPE_DOCUMENT = 'DOCUMENT';

  browseVm.TYPE_FOLDER = TYPE_FOLDER;
  browseVm.TYPE_DOCUMENT = TYPE_DOCUMENT;
  browseVm.displayCreateInput = false;
  browseVm.newFolderName = '';
  browseVm.createFolder = createFolder;
  browseVm.createFolderByEnter = createFolderByEnter;
  browseVm.disableFolder = disableFolder;
  browseVm.goToFolder = goToFolder;
  browseVm.handleActionOnNodeSelection = handleActionOnNodeSelection;
  browseVm.showCreateFolderInput = showCreateFolderInput;
  browseVm.hideCreateFolderInput = hideCreateFolderInput;

  browseVm.$onInit = $onInit;

  ////////////

  function $onInit() {
    browseVm.permissions = {};
    browseVm.isSharedSpace = false;
    browseVm.canCreateFolder = false;

    // Cannot add version with multiple nodes
    browseVm.canDisplayFiles = browseVm.canDisplayFiles && browseVm.nodeItems && browseVm.nodeItems.length === 1;

    functionalityRestService.getFunctionalityParams('WORK_GROUP__CREATION_RIGHT')
      .then(function(creationRight) {
        browseVm.canCreateWorkGroup = creationRight.enable;
        browseVm.canCreateFolder =
            (browseVm.isSharedSpace && browseVm.canCreateWorkGroup) ||
            (!browseVm.isSharedSpace);
      });

    loadBrowseList();

    $transitions.onStart({}, function() {
      browseVm.$mdDialog.cancel();
    });
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
    var failedNodes = [],
      nodeItems = [],
      promises = [];

    _.forEach(browseVm.nodeItems, function(nodeItem) {
      var deferred = $q.defer();

      browseVm.restService.copy(browseVm.currentFolder.workGroup, nodeItem.uuid,
        browseVm.currentFolder.uuid, browseVm.kind).then(function(newNode) {
        var _newNode = browseVm.restService.restangularize(newNode[0]);

        deferred.resolve(_newNode);
      }).catch(function(error) {
        failedNodes.push(_.assign(error, {nodeItem: nodeItem}));
        deferred.reject(error);
      });
      promises.push(deferred.promise);
    });

    $q.all(promises).then(function(_nodeItems) {
      nodeItems = _nodeItems;
    }).finally(function() {
      browseVm.$mdDialog.hide({
        nodeItems: nodeItems,
        failedNodes: failedNodes,
        folder: browseVm.currentFolder
      });
    });
  }

  /**
   * @name disableFolder
   * @desc Check if folder is in list of selected items and disable it to prevent from moving a folder inside itself
   * @param {Object} folder - Folder to check
   * @memberOf linshare.components.BrowseController
   */
  function disableFolder(folder) {
    return _.find(browseVm.nodeItems, folder);
  }

  /**
   * @name filterNodeListByType
   * @desc Filter out files from list if browser can't display files
   * @return {Array<Object>} list - list to filter
   * @return {Array<Object>} list - copy of list param with files filtered out if canDisplayFiles is false
   * @memberOf linshare.components.BrowseController
   */
  function filterNodeListByType(list) {
    if (browseVm.canDisplayFiles) {
      return _.clone(list);
    }

    return _.filter(list, {'type': TYPE_FOLDER});
  }

  /**
   * @name goToFolder
   * @desc Enter inside a folder
   * @param {Object} selectedFolder - Folder where to enter
   * @param {boolean} goToParent - Enter in parent folder with previous arrow button
   * @memberOf linshare.components.BrowseController
   */
  function goToFolder(selectedFolder, goToParent) {
    if (!browseVm.canCreateFolder) {
      return;
    }

    hideCreateFolderInput();

    if (browseVm.isSharedSpace) {
      browseVm.restService = workgroupNodesRestService;
      browseVm.restService.get(selectedFolder.uuid, selectedFolder.uuid, true, true).then(function(currentFolder) {
        browseVm.currentFolder = currentFolder;
        browseVm.currentFolder.workgroupUuid = currentFolder.workGroup;
        browseVm.currentFolder.workgroupName = currentFolder.name;
        browseVm.restService.getList(currentFolder.workGroup).then(function(currentList) {
          browseVm.currentList = _.orderBy(filterNodeListByType(currentList), 'modificationDate', 'desc');
          browseVm.isSharedSpace = false;
        });
      });
    } else if (goToParent && browseVm.currentFolder.parent === browseVm.currentFolder.workGroup) {
      browseVm.currentFolder = null;
      loadBrowseList();
    } else if (browseVm.canCreateFolder) {
      var folderUuid = goToParent ? selectedFolder.parent : selectedFolder.uuid;
      var type = !browseVm.canDisplayFiles ? TYPE_FOLDER : undefined;

      browseVm.restService.getList(selectedFolder.workGroup, folderUuid, type).then(function(folders) {
        browseVm.currentList = _.orderBy(folders, 'modificationDate', 'desc');
      });

      if (!goToParent) {
        _.assign(browseVm.currentFolder, selectedFolder);
      } else {
        browseVm.restService.get(selectedFolder.workGroup, folderUuid).then(function(parentFolder) {
          _.assign(browseVm.currentFolder, parentFolder);
        });
      }
    }
  }

  /**
   * @name loadBrowseList
   * @desc Load browse list from Workgroup root folder or child folder
   * @memberOf linshare.components.BrowseController
   */
  function loadBrowseList() {
    if (_.isNil(browseVm.currentFolder) || _.isNil(browseVm.currentFolder.role)) {
      browseVm.currentFolder = {};
      browseVm.restService = workgroupRestService;
      browseVm.isSharedSpace = true;

      browseVm.restService.getList(true)
        .then(function(currentList) {
          browseVm.currentList = _.orderBy(currentList, 'modificationDate', 'desc');

          return workgroupPermissionsService.getWorkgroupsPermissions(currentList);
        })
        .then(function(workgroupsPermissions) {
          browseVm.permissions = workgroupPermissionsService.formatPermissions(workgroupsPermissions);
        });
    } else {
      browseVm.sourceFolder = _.cloneDeep(browseVm.currentFolder);
      browseVm.isSharedSpace = false;

      workgroupPermissionsService
        .getWorkgroupsPermissions(
          [{ uuid: browseVm.currentFolder.workGroup }]
        )
        .then(function(workgroupsPermissions) {
          browseVm.permissions = workgroupPermissionsService.formatPermissions(workgroupsPermissions);
        });
    }
    browseVm.validateAction = browseVm.isMove ? moveNode : copyNode;
  }

  /**
   * @name moveNode
   * @desc Move the node
   * @memberOf linshare.components.BrowseController
   */
  function moveNode() {
    var failedNodes = [],
      nodeItems = [],
      promises = [];

    _.forEach(browseVm.nodeItems, function(nodeItem) {
      var deferred = $q.defer();

      nodeItem.parent = browseVm.currentFolder.uuid;
      if (nodeItem.workGroup === browseVm.currentFolder.workGroup) {
        browseVm.restService.update(nodeItem.workGroup, nodeItem).then(newNode => {
          deferred.resolve(newNode);
        }).catch(function(error) {
          failedNodes.push(_.assign(error, {nodeItem: nodeItem}));
          deferred.reject(error);
        });
      } else {
        browseVm.restService.copy(browseVm.currentFolder.workGroup, nodeItem.uuid,
          browseVm.currentFolder.uuid, browseVm.kind).then((newNode) => {
          nodeItem.remove().then(() => {
            deferred.resolve(newNode);
          });
        }).catch(function(error) {
          failedNodes.push(_.assign(error, {nodeItem: nodeItem}));
          deferred.reject(error);
        });
      }

      promises.push(deferred.promise);
    });

    $q.all(promises).then(function(_nodeItems) {
      nodeItems = _nodeItems;
    }).finally(function() {
      browseVm.$mdDialog.hide({
        nodeItems: nodeItems,
        failedNodes: failedNodes,
        folder: browseVm.currentFolder
      });
    });
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
      goToFolder(node);
    }
  }

  /**
   * @name showCreateFolderInput
   * @desc show create new folder input
   * @memberOf linshare.components.BrowseController
   */
  function showCreateFolderInput() {
    browseVm.displayCreateInput = true;
    const offsetTop = $('#js-lv-create-new-folder').offset().top;

    if (offsetTop < 0) {
      $('#lv-dialog-content-ctn .lv-ctn').animate({
        'scrollTop': $('#js-lv-create-new-folder').offset().top
      }, 300);
    }
    $('#js-lv-create-new-folder input').trigger('focus');
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

  /**
   * @name createFolder
   * @desc Create a folder
   * @memberOf linshare.components.BrowseController
   */
  function createFolder() {
    if (browseVm.canCreateFolder && itemUtilsService.isNameValid(browseVm.newFolderName)) {
      const newFolderObject = browseVm.restService.restangularize({
        name: browseVm.newFolderName,
        parent: browseVm.currentFolder.uuid,
        type: TYPE_FOLDER
      }, browseVm.currentFolder.workGroup);

      browseVm.restService.create(browseVm.currentFolder.workGroup, newFolderObject, false)
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
}
